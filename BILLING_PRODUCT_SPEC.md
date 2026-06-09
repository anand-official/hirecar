# Billing & Product Specification

## 1. Available Plans
- **Starter**: For small vendors. Limits: 5 vehicles. Basic analytics.
- **Growth**: For medium fleets. Limits: 25 vehicles. Advanced analytics, Priority alerts.
- **Pro**: For large fleets. Limits: 100 vehicles. API access, Bulk upload.
- **Business/Enterprise**: Custom sales-led tiers.

## 2. Billing Intervals
- **Monthly**: Standard tier pricing.
- **Quarterly**: (New Feature) Allows vendors to pay every 3 months for a slight discount/convenience over monthly without committing to annual.
  
## 3. Upgrades & Downgrades
- **Upgrades**: Processed immediately. Users pay a prorated amount for the remainder of the billing cycle. Premium access granted as soon as Stripe confirms the payment (`customer.subscription.updated` / `checkout.session.completed`).
- **Downgrades**: Scheduled for the end of the current billing cycle. Access remains at the higher tier until the new cycle starts to prevent accidental feature loss.

## 4. Cancellation Behavior
- **Policy**: Cancel at period end.
- **Access**: The user retains full access to their plan features until the exact date their current paid period expires.
- **Reactivation**: Users can resume their subscription via the Customer Portal before the period fully ends without losing data.

## 5. Failed Payments
- **Behavior**: If an invoice fails, the subscription state changes to `past_due`. 
- **Access**: Soft lock. The user is prompted to update their payment method in the Billing Dashboard. Paid features may be temporarily restricted or put into a grace period based on business logic. Once paid, access is fully restored.

## 6. Invoices
- **Access**: All invoices are retrievable from the `/vendor/billing` dashboard.
- **Downloads**: Users can click to view or download a Stripe-hosted PDF of any finalized invoice.
- **Transparency**: Every successful charge generates a corresponding invoice visible to organization members.

## 7. Edge Cases & Support
- **Duplicate Signups**: Handled by passing `stripe_customer_id` strictly.
- **Webhook Delays**: The UI will poll or prompt the user to wait briefly after checkout.
- **Admin Tools**: Support can look up the `stripe_customer_id` via Supabase to assist with refunds or stuck states directly in the Stripe Dashboard.
