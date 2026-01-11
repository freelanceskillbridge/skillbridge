import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">Effective Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-6 lg:p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">SkillBridge Freelance Privacy Policy</h2>
              <p className="text-lg text-muted-foreground">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  H. Privacy Policy
                </h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Data Collection:</strong> We collect account, usage, and transaction data necessary for platform operation.</p>
                  <p><strong>Purpose Limitation:</strong> Data is used solely for platform operation, service improvement, and communication with users.</p>
                  <p><strong>No Data Sale:</strong> User data is not sold to third parties for marketing or advertising purposes.</p>
                  <p><strong>Service Providers:</strong> Limited data may be shared with trusted service providers essential to platform functionality (payment processors, hosting services, etc.).</p>
                  <p><strong>Security Measures:</strong> We implement technical and organizational safeguards to protect your data from unauthorized access, alteration, or destruction.</p>
                  <p><strong>Access Rights:</strong> Users may request access to their personal data held by us.</p>
                  <p><strong>Correction Rights:</strong> Users may request correction of inaccurate or incomplete personal data.</p>
                  <p><strong>Retention Policy:</strong> Data is retained only as long as necessary for the purposes stated in this policy or as required by law.</p>
                  <p><strong>Cookies:</strong> Cookies and similar technologies may be used to enhance user experience, analyze platform usage, and remember preferences.</p>
                  <p><strong>Policy Changes:</strong> Updates to this privacy policy will be communicated transparently. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Account Information:</strong> When you register, we collect your name, email address, and password.</p>
                  <p><strong>Profile Information:</strong> Optional information you provide to enhance your profile, such as skills, experience, and portfolio links.</p>
                  <p><strong>Payment Information:</strong> For transactions, we collect payment details necessary to process payments (handled by secure third-party processors).</p>
                  <p><strong>Usage Data:</strong> Information about how you interact with the platform, including job applications, submissions, and platform features used.</p>
                  <p><strong>Communication Data:</strong> Records of communications between you and SkillBridge, including support requests and feedback.</p>
                  <p><strong>Technical Data:</strong> IP address, browser type, device information, and cookies data for security and analytics purposes.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">How We Use Your Information</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>• To provide and maintain the SkillBridge platform</p>
                  <p>• To process payments and manage earnings</p>
                  <p>• To match freelancers with appropriate job opportunities</p>
                  <p>• To communicate important updates, security alerts, and support messages</p>
                  <p>• To improve platform features and user experience</p>
                  <p>• To ensure platform security and prevent fraud</p>
                  <p>• To comply with legal obligations</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Data Security</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>We implement industry-standard security measures to protect your information:</p>
                  <p>• Encryption of sensitive data in transit and at rest</p>
                  <p>• Regular security audits and vulnerability assessments</p>
                  <p>• Access controls and authentication systems</p>
                  <p>• Secure infrastructure and hosting environments</p>
                  <p>• Employee training on data protection and privacy</p>
                  <p>While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Your Rights</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>Depending on your location, you may have certain rights regarding your personal data:</p>
                  <p><strong>Access:</strong> Request a copy of your personal data</p>
                  <p><strong>Correction:</strong> Request correction of inaccurate data</p>
                  <p><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</p>
                  <p><strong>Restriction:</strong> Request restriction of processing in certain circumstances</p>
                  <p><strong>Portability:</strong> Request transfer of your data to another service</p>
                  <p><strong>Objection:</strong> Object to certain types of processing</p>
                  <p>To exercise these rights, please contact us using the information below.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">International Data Transfers</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>SkillBridge operates globally, and your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in accordance with applicable data protection laws.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Children's Privacy</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>SkillBridge is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child under 18, we will take steps to delete that information.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Changes to This Policy</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>We may update this Privacy Policy from time to time. When we make changes, we will update the "Effective Date" at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your information.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Contact Us</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
                  <p>• Email: privacy@skillbridge.com</p>
                  <p>• Platform: Through the support feature in your dashboard</p>
                  <p>We will respond to your inquiry as soon as possible.</p>
                </div>
              </section>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">Questions or Concerns?</h4>
                    <p className="text-sm text-muted-foreground">Contact us if you have any questions about our privacy practices.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <Link to="/terms-of-service">View Terms of Service</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/">Return to Home</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrivacyPolicy;