import Header from '@/components/Header';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <section className="max-w-2xl mx-auto bg-white rounded-lg shadow-card p-8">
          <h1 className="text-3xl font-bold mb-6 text-primary">Refund Policy</h1>
          <p className="mb-4 text-muted-foreground">
            Thank you for shopping with us. If you are not entirely satisfied with your purchase, we’re here to help.
          </p>
          <h2 className="text-xl font-semibold mt-6 mb-2">Eligibility for Refunds</h2>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>To be eligible for a refund, your item must be unused and in the same condition that you received it.</li>
            <li>Your item must be in the original packaging.</li>
            <li>You must provide a receipt or proof of purchase.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-6 mb-2">Refund Process</h2>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Once we receive your item, we will inspect it and notify you of the status of your refund.</li>
            <li>If your return is approved, we will initiate a refund to your original method of payment.</li>
            <li>You will receive the credit within a certain number of days, depending on your card issuer’s policies.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-6 mb-2">Late or Missing Refunds</h2>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>If you haven’t received a refund yet, first check your bank account again.</li>
            <li>Then contact your credit card company; it may take some time before your refund is officially posted.</li>
            <li>If you’ve done all of this and you still have not received your refund, please contact us.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about our refund policy, please contact our support team.
          </p>
        </section>
      </main>
    </div>
  );
};

export default RefundPolicy;
