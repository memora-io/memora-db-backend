import { environment } from '@/config/environment';
import Stripe from 'stripe';

export function getStripe(){
  const client = new Stripe(environment.STRIPE_KEY, {
      apiVersion: '2023-08-16',
      httpClient: Stripe.createFetchHttpClient(), // use fetch instead of node http
  });
  return client;
}