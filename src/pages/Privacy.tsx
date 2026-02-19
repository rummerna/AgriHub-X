import { Shield } from "lucide-react";

const Privacy = () => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    <div className="flex items-center gap-2 mb-2"><Shield className="w-6 h-6 text-primary" /><h1 className="text-3xl font-display font-bold">Privacy Policy</h1></div>
    <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

    <div className="prose prose-sm max-w-none space-y-6">
      <section>
        <h2 className="text-xl font-display font-semibold">Our Commitment</h2>
        <p className="text-muted-foreground">As student developers, we take your privacy seriously. Our no-GPS-tracking policy came directly from listening to 25 farmers in Tala who told us they were uncomfortable with constant location tracking. AgriHubX is designed with privacy at its core, aligned with the Kenya Data Protection Act 2019.</p>
      </section>

      <section>
        <h2 className="text-xl font-display font-semibold">Information We Collect</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Account information (name, email)</li>
          <li>Profile information (optional)</li>
          <li>Location: county/region only, voluntary — <strong>NO GPS TRACKING</strong></li>
          <li>Usage information</li>
          <li>Transaction information</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-display font-semibold">What We Don't Do</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>We do NOT sell personal information</li>
          <li>We do NOT track location without consent</li>
          <li>We do NOT share data with third parties</li>
          <li>We do NOT require phone numbers</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-display font-semibold">Your Rights</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Access, correct, or delete your data</li>
          <li>Export your data</li>
          <li>Withdraw consent at any time</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-display font-semibold">Contact</h2>
        <p className="text-muted-foreground">For privacy inquiries: rummerna@gmail.com</p>
      </section>
    </div>
  </div>
);

export default Privacy;
