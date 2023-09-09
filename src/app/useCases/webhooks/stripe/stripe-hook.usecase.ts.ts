import { DbClient } from '@/infra/clients/db.client';
import { getStripe } from '@/utils/get-stripe';
import { logger } from '@/utils/logger';
import { AppError } from '@/app/errors/app.error';
import { randomUUID } from 'crypto';
import mixpanel from '@/utils/mixpanel';
import { ServerError } from '@/app/errors/server.error';
import clerkClient from '@clerk/clerk-sdk-node';
import { environment } from '@/config/environment';

export class StripeHookUseCase {
  constructor(
    private dbClient: DbClient,
  ) { }

  async execute(rawBody: any, signature: string) {
    if (!signature) throw new AppError('signature not found', 400)
    const hookId = randomUUID()
    const stripe = getStripe()
    const stripeEndpointSecret = environment.STRIPE_ENDPOINT_KEY;
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      stripeEndpointSecret,
      undefined
    );

    logger(`${hookId} - EVENT TYPE - ${event.type}`)
    const object = event.data.object as any
    const customerId = object.customer
    const metadataHasProps = Object.keys(object.metadata).length
    if (metadataHasProps) logger(`${hookId} - METADATA -`, object.metadata)
    let userId = object.metadata?.user_id
    switch (event.type) {
      case 'checkout.session.completed':
        logger(`${hookId} - checkout completed, wait subscription hook`)
        if (!userId) throw new ServerError('userId must be provided for this to be handled')
        mixpanel.track('Pro plan purchased', {
          distinct_id: userId,
        })
        break
      case 'customer.subscription.created':
        logger(`${hookId} - subscription created on stripe`)
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        if (!userId) {
          // if not receives user id in metadata, tries to get by customer id in our database
          const user = await this.dbClient.client.users.findFirst({
            where: {
              stripe_customer_id: customerId
            }
          })
          // if not found by customer id throws an error
          if (!user) throw new ServerError('userId must be provided for this event')
          userId = user?.id
        }

        await this.changeUserPlan(userId, customerId, object.status, hookId)
        break;
      default:
        logger(`${hookId} - Unhandled event type ${event.type}`);
    }
  }

  private async changeUserPlan(userId: string, customerId: string, status: string, hookId: string) {
    logger(`${hookId} - subscription status`, status)
    if (!['active', 'canceled'].includes(status)) {
      logger(`${hookId} - this subscription status (${status}) does not change plan`)
      return
    }

    let plan = status === 'active' ? 'pro' : 'hobby'
    await this.dbClient.client.users.update({
      data: {
        plan,
        updated_at: new Date(),
        stripe_customer_id: customerId
      },
      where: {
        id: userId
      }
    })
    const clerkUser = await clerkClient.users.getUser(userId)
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        plan,
        stripe_customer_id: customerId
      },
    })
    logger(`${hookId} - changed user plan to ${plan}`)
  }
}