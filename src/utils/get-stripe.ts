import Stripe from 'stripe';

export function getStripe(){
  if(!process.env?.STRIPE_KEY){
    throw new Error('Can not initialize Stripe without STRIPE_KEY');
  }
  const client = new Stripe(process.env.STRIPE_KEY, {
      apiVersion: '2023-08-16',
      httpClient: Stripe.createFetchHttpClient(), // use fetch instead of node http
  });
  return client;
}