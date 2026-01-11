import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground">Effective Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-6 lg:p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">SkillBridge Freelance Platform</h2>
              <p className="text-lg text-muted-foreground">
                These terms govern your use of SkillBridge Freelance platform. Please read them carefully.
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  A. Platform Philosophy, Domain, Taxes & Trust
                </h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Mission & Fair Access:</strong> SkillBridge exists to provide fair, high‑quality freelance opportunities globally, with special consideration for regions disproportionately affected by platform fees and compliance barriers.</p>
                  <p><strong>Domain Transparency:</strong> The platform currently operates under skillbridgefreelance.netlify.app. This transition from the former domain was made to improve accessibility, reliability, and global participation.</p>
                  <p><strong>Global Inclusion:</strong> Our domain and infrastructure choices are designed to support freelancers worldwide, including emerging markets.</p>
                  <p><strong>Reduced Overhead Goal:</strong> Platform processes are optimized to minimize non‑essential costs that can reduce freelancer earnings.</p>
                  <p><strong>Compliance Awareness:</strong> Freelancers are responsible for understanding and complying with local tax and legal obligations applicable to their income.</p>
                  <p><strong>User Choice & Control:</strong> Users retain control over how they manage their earnings, accounts, and participation.</p>
                  <p><strong>Transparency Commitment:</strong> We communicate clearly about fees, tiers, job allocation, and payment processes.</p>
                  <p><strong>No Hidden Platform Deductions:</strong> SkillBridge does not impose undisclosed deductions beyond clearly stated fees.</p>
                  <p><strong>Data Respect:</strong> We collect only data necessary to operate the platform and improve service quality.</p>
                  <p><strong>Community Quality:</strong> Our policies prioritize professional growth, skill development, and fair competition.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">B. Membership Tiers & Benefits</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Tier Structure:</strong> SkillBridge offers three tiers: Regular (USD 15), Pro (USD 25), and VIP (USD 49).</p>
                  <p><strong>Tier Purpose:</strong> Tiers are designed to align opportunity access with commitment and professionalism.</p>
                  <p><strong>VIP Priority:</strong> VIP members receive priority consideration for higher‑payout jobs.</p>
                  <p><strong>Pro Advantage:</strong> Pro members receive enhanced access compared to Regular members.</p>
                  <p><strong>Regular Access:</strong> Regular members can participate in available jobs subject to demand.</p>
                  <p><strong>Tier Reflection Time:</strong> Tier upgrades typically reflect within minutes of confirmation.</p>
                  <p><strong>Non‑Refundable Fees:</strong> Registration and tier fees are non‑refundable.</p>
                  <p><strong>Quality Signaling:</strong> Tier fees help reduce low‑quality and automated submissions.</p>
                  <p><strong>Fair Competition:</strong> All tiers compete on quality, not solely on speed.</p>
                  <p><strong>Account Integrity:</strong> Each user may hold only one account per individual.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">C. Job Posting, Allocation & Competition</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Availability‑Based Posting:</strong> Jobs are posted based on client and platform availability.</p>
                  <p><strong>First‑Come Participation:</strong> Jobs may be accepted by multiple freelancers on a first‑come basis.</p>
                  <p><strong>Non‑Exclusive Tasks:</strong> A single job may allow multiple submissions.</p>
                  <p><strong>Time‑Bound Tasks:</strong> Each job includes a stated submission timeframe.</p>
                  <p><strong>Deadline Enforcement:</strong> Submissions after the deadline are automatically rejected.</p>
                  <p><strong>Quality Review:</strong> All submissions undergo quality assessment.</p>
                  <p><strong>Comparative Evaluation:</strong> Submissions may be compared against others for the same task.</p>
                  <p><strong>Best‑Fit Selection:</strong> Only the highest‑quality submission(s) qualify for approval.</p>
                  <p><strong>No Guarantee of Selection:</strong> Submission does not guarantee approval or payment.</p>
                  <p><strong>Professional Standards:</strong> Original, human‑quality work is required.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">D. Payments, Earnings & Withdrawals</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Approval Requirement:</strong> Payments are issued only after task approval.</p>
                  <p><strong>Pending Period:</strong> Approved earnings may enter a short pending period.</p>
                  <p><strong>Account Credit:</strong> Earnings are credited to user accounts once finalized.</p>
                  <p><strong>Minimum Withdrawal:</strong> The fixed minimum withdrawal amount is USD 2,000.</p>
                  <p><strong>Withdrawal Schedule:</strong> Withdrawals are processed up to twice per month (approximately every 15 days).</p>
                  <p><strong>Operational Safeguards:</strong> Withdrawal limits help ensure platform stability and compliance.</p>
                  <p><strong>Payment Method Disclosure:</strong> Current payment workflows may involve manual verification steps.</p>
                  <p><strong>Recommended Email Match:</strong> Payments should be made using the email registered on the platform.</p>
                  <p><strong>Alternate Email Verification:</strong> If another email is used, users must submit the transaction ID for verification.</p>
                  <p><strong>Verification Communication:</strong> Any verification delay triggers prompt email communication.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">E. Taxes, Fees & Legal Responsibility</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>User Responsibility:</strong> Freelancers are solely responsible for their personal tax reporting.</p>
                  <p><strong>No Tax Advice:</strong> SkillBridge does not provide tax or legal advice.</p>
                  <p><strong>Independent Contractors:</strong> Users operate as independent contractors, not employees.</p>
                  <p><strong>No Withholding:</strong> SkillBridge does not withhold taxes on behalf of users.</p>
                  <p><strong>Local Law Compliance:</strong> Users must comply with laws applicable in their jurisdiction.</p>
                  <p><strong>Currency Fluctuations:</strong> Exchange rates and third‑party fees may affect final amounts received.</p>
                  <p><strong>Platform Fees Disclosure:</strong> Any applicable platform fees are disclosed upfront.</p>
                  <p><strong>Economic Conditions:</strong> Global economic conditions may influence policies and limits.</p>
                  <p><strong>Policy Updates:</strong> Tax‑related processes may change to reflect legal requirements.</p>
                  <p><strong>Good‑Faith Operation:</strong> All processes are designed to operate in good faith and transparency.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">I. Disputes, Liability & Administration (Most Restrictive)</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Platform Discretion:</strong> SkillBridge retains discretion in approvals and removals.</p>
                  <p><strong>No Guaranteed Income:</strong> Earnings depend on performance and availability.</p>
                  <p><strong>Service Interruptions:</strong> We are not liable for interruptions beyond control.</p>
                  <p><strong>Limitation of Liability:</strong> Liability is limited to the extent permitted by law.</p>
                  <p><strong>Indemnification:</strong> Users agree to indemnify SkillBridge against misuse.</p>
                  <p><strong>Dispute Resolution:</strong> Disputes are handled via internal review first.</p>
                  <p><strong>Governing Principles:</strong> Policies are governed by applicable international principles.</p>
                  <p><strong>Severability:</strong> Invalid provisions do not affect remaining terms.</p>
                  <p><strong>Assignment:</strong> Users may not assign rights without consent.</p>
                  <p><strong>Force Majeure:</strong> We are not liable for events beyond reasonable control.</p>
                  <p><strong>Amendments:</strong> Terms may be updated with notice.</p>
                  <p><strong>Continued Use:</strong> Continued use implies acceptance of updates.</p>
                  <p><strong>Termination Rights:</strong> We may terminate accounts for violations.</p>
                  <p><strong>User Termination:</strong> Users may close accounts subject to obligations.</p>
                  <p><strong>Outstanding Balances:</strong> Unapproved earnings are forfeited upon termination.</p>
                  <p><strong>Communication Records:</strong> Records may be kept for compliance.</p>
                  <p><strong>Language Control:</strong> English version controls interpretation.</p>
                  <p><strong>No Waiver:</strong> Failure to enforce does not waive rights.</p>
                  <p><strong>Entire Agreement:</strong> These terms constitute the entire agreement.</p>
                  <p><strong>Acceptance:</strong> By registering, users agree to all terms herein.</p>
                </div>
              </section>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">Contact Information</h4>
                    <p className="text-sm text-muted-foreground">For questions about these Terms of Service, please contact us.</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to="/">Return to Home</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TermsOfService;