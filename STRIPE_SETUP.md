# Stripe Integration Setup

## Overview
The NightlyQuest app is now connected to Supabase and ready for Stripe integration. User signups are stored in the Supabase key-value store.

## What's Implemented

### Backend (Supabase Edge Functions)
- **Free Trial Signup**: `POST /make-server-9bf47a34/signup/free`
- **Adventurer Tier**: `POST /make-server-9bf47a34/signup/adventurer`
- **Legendary Tier**: `POST /make-server-9bf47a34/signup/legendary`

### Frontend
- Three-tier signup flow with conditional forms
- Email field added for paid tiers (Adventurer & Legendary)
- Form validation and submission handling
- Success states and error handling
- Auto-redirect to Stripe checkout for paid tiers

## Next Steps: Stripe Setup

### 1. Create Stripe Account
1. Go to https://stripe.com and create an account
2. Complete your business profile

### 2. Create Products
Create two recurring products in Stripe:

**Adventurer - $9/month**
- Product name: "NightlyQuest Adventurer"
- Price: $9.00 USD
- Billing period: Monthly
- Type: Recurring subscription

**Legendary - $19/month**
- Product name: "NightlyQuest Legendary"  
- Price: $19.00 USD
- Billing period: Monthly
- Type: Recurring subscription

### 3. Create Payment Links
For each product, create a Payment Link:
1. In Stripe Dashboard, go to Payment Links
2. Click "New payment link"
3. Select the product
4. Enable "Collect customer email" (optional since we already have it)
5. Set success URL (where to redirect after payment)
6. Copy the payment link

### 4. Update Code
In `/workspaces/default/code/src/app/App.tsx`, replace these placeholder URLs:

**Line ~1432** (Adventurer tier):
```typescript
// Current placeholder:
window.location.href = 'https://buy.stripe.com/test_ADVENTURER_LINK';

// Replace with your actual Stripe payment link:
window.location.href = 'https://buy.stripe.com/YOUR_ACTUAL_ADVENTURER_LINK';
```

**Line ~1435** (Legendary tier):
```typescript
// Current placeholder:
window.location.href = 'https://buy.stripe.com/test_LEGENDARY_LINK';

// Replace with your actual Stripe payment link:
window.location.href = 'https://buy.stripe.com/YOUR_ACTUAL_LEGENDARY_LINK';
```

### 5. Deploy Edge Function
After updating the Stripe links:
1. Go to the Make settings page
2. Deploy the Supabase edge function
3. Test the signup flow

## Data Structure

### All Signups (Free/Adventurer/Legendary)
```json
{
  "tier": "free", // or "adventurer" or "legendary"
  "email": "parent@email.com",
  "interests": ["Dragons", "Space", "Custom Interest"],
  "adventureType": ["Fantasy", "Sci-Fi", "Custom Adventure"],
  "readingLevel": "6-8",
  "deliveryTime": "19:30",
  "timezone": "America/New_York",
  "childName": "Allie",
  "pronouns": "she/her",
  "createdAt": "2026-05-31T..."
}
```

**Note:** Email is now collected for all tiers. If the user enters their email on the hero section, it will be pre-populated in the signup form.

## Testing

### Test Free Trial Flow
1. Click "Start Free Trial" from any tier card
2. Fill out the form (no email required)
3. Submit - data should be saved to Supabase
4. Check server logs for confirmation

### Test Paid Tier Flow  
1. Click "Go Adventure" or "Become Legendary"
2. Fill out the form (email required)
3. Submit - data saves to Supabase, then redirects to Stripe
4. Complete payment in Stripe (use test card 4242 4242 4242 4242)

## Important Notes

⚠️ **Privacy Compliance**: This app collects children's information. Ensure you comply with:
- COPPA (Children's Online Privacy Protection Act)
- GDPR (if serving EU users)
- Other relevant data protection regulations

⚠️ **Production Readiness**: 
- Replace test Stripe links with production links before launch
- Set up Stripe webhooks to handle subscription events
- Implement proper error handling and retry logic
- Add email notifications for successful signups

## Webhook Integration (Recommended)

To track successful payments, set up Stripe webhooks:

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://{projectId}.supabase.co/functions/v1/make-server-9bf47a34/webhook/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`
4. You'll need to add a webhook handler in `supabase/functions/server/index.tsx`
