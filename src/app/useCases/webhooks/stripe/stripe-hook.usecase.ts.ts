import { Readable } from 'stream';
import { DbClient } from '@/infra/clients/db.client';
import { getStripe } from '@/utils/get-stripe';
import { logger } from '@/utils/logger';
import { AppError } from '@/app/errors/app.error';
import { randomUUID } from 'crypto';

export class StripeHookUseCase {
  constructor(
    private dbClient: DbClient,
  ) { }

  async execute(data: any, signature: string) {
    const callName = `${this.constructor.name}-${this.execute.name}`;
    logger(`${callName} - input`, {
      data,
      signature
    });
    if (!signature) throw new AppError('signature not found', 400)
    const stripe = getStripe()
    const stripeEndpointSecret = 'whsec_a509efed8276858e48e61aceb2dd9d0c672aa6f851cc7767a0042cc3864eb341'
    const buf = await this.buffer(data)
    const rawBody = buf.toString('utf8');

    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      stripeEndpointSecret,
      undefined
    );

    logger(`${event.type}`)
    const object = event.data.object as any
    const customer_id = object.customer
    logger(`METADATA -`, object.metadata)

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.created':
        // todo retrieve user based in customer (DB)
        await this.changeSubscriptionByStatus(object.status, customer_id)
        break;
      case 'checkout.session.completed':
        const user_id = object.metadata?.user_id
        await this.linkUserIdWithCustomer(user_id, customer_id)

        break
      default:
        logger(`Unhandled event type ${event.type}`);
    }
  }

  private async changeSubscriptionByStatus(status: string, customer_id: string) {
    const subscription = await this.dbClient.client.users_subscriptions.findFirst({
      where: {
        stripe_customer_id: customer_id
      }
    })
    logger('subscription status', status)
    if (!subscription) throw new Error('user not found for this customer_id')
    if(status === 'active') {
      // TODO update clerk using api
      this.dbClient.client.users_subscriptions.update({
        data: {
          plan: 'pro',
          status: 'active'
        },
        where: {
          id: subscription.id
        }
      })
    } else if (status === 'cancelled') {
      // TODO update clerk using api
      this.dbClient.client.users_subscriptions.update({
        data: {
          plan: 'pro',
          status: 'cancelled'
        },
        where: {
          id: subscription.id
        }
      })
    }
  }

  private async linkUserIdWithCustomer(user_id: string, customer_id: string) {
    // here we match the user_id with the customer_id
    logger(`${this.linkUserIdWithCustomer.name}`, {
      user_id,
      customer_id
    })
    await this.dbClient.client.users_subscriptions.create({
      data: {
        id: randomUUID(),
        user_id: user_id,
        stripe_customer_id: customer_id,
        plan: 'pro',
        status: 'created',
      }
    })
    // todo: link user to customer in clerk via api
    // clerkClient.users.updateUserMetadata(user_id, {
    //   publicMetadata: {
    //     plan: 'pro',
    //     customer_id: customer_id,
    //   }
    // })
  }

  private async buffer(readable: Readable) {
    const chunks = [];
    for await (const chunk of readable) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
  }
}


