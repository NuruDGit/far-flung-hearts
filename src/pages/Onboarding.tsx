import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Heart, Globe, Calendar, ArrowRight, Check } from 'lucide-react'; // Import icons
import { toast } from 'sonner';

export default function Onboarding() {
    const { user, refreshSubscription } = useAuth(); // refreshSubscription alias for refreshing profile data if needed
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        display_name: user?.user_metadata?.display_name || '',
        bio: '',
        city: '',
        country: '',
        relationship_start_date: '',
        relationship_status: 'dating',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: formData.display_name,
                    bio: formData.bio,
                    city: formData.city,
                    country: formData.country,
                    relationship_start_date: formData.relationship_start_date || null,
                    relationship_status: formData.relationship_status,
                    // We can add a flag here if we had one, e.g., onboarding_completed: true
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("Profile personalized! Welcome home.");

            // Navigate to app after short delay for effect
            setTimeout(() => {
                navigate('/app');
            }, 1000);

        } catch (error: any) {
            console.error('Error saving profile:', error);
            toast.error(error.message || "Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    // --- Step Components ---

    const renderStep1_Identity = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
                <div className="w-16 h-16 bg-love-light mx-auto rounded-full flex items-center justify-center mb-4 shadow-love">
                    <Heart className="text-love-heart fill-current h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
                    First, let's introduce you.
                </h2>
                <p className="text-muted-foreground mt-2">What should we call you in your shared space?</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="display_name">Nickname / Display Name</Label>
                    <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={e => updateField('display_name', e.target.value)}
                        placeholder="e.g. Honey, Alex, Bestie..."
                        className="h-12 text-lg"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bio">Short Bio (Optional)</Label>
                    <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={e => updateField('bio', e.target.value)}
                        placeholder="A romantic at heart..."
                        className="resize-none"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2_Location = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                    <Globe className="text-blue-500 h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                    Where in the world are you?
                </h2>
                <p className="text-muted-foreground mt-2">We use this to show your time & weather to your partner.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            value={formData.city}
                            onChange={e => updateField('city', e.target.value)}
                            placeholder="Paris"
                            className="h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            value={formData.country}
                            onChange={e => updateField('country', e.target.value)}
                            placeholder="France"
                            className="h-12"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3_Relationship = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
                <div className="w-16 h-16 bg-pink-50 mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm border border-pink-100">
                    <Calendar className="text-pink-500 h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                    Your Love Story
                </h2>
                <p className="text-muted-foreground mt-2">When did your journey together begin?</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="anniversary">Anniversary Date</Label>
                    <Input
                        id="anniversary"
                        type="date"
                        value={formData.relationship_start_date}
                        onChange={e => updateField('relationship_start_date', e.target.value)}
                        className="h-12 justify-center text-center"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBFB] p-4">
            <Card className="w-full max-w-lg p-8 shadow-xl border-border/40 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
                    <div
                        className="h-full bg-gradient-to-r from-love-heart to-love-coral transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Dynamic Step Content */}
                <div className="mt-4 min-h-[300px] flex flex-col justify-center">
                    {step === 1 && renderStep1_Identity()}
                    {step === 2 && renderStep2_Location()}
                    {step === 3 && renderStep3_Relationship()}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between items-center pt-4 border-t">
                    {step > 1 ? (
                        <Button variant="ghost" onClick={() => setStep(step - 1)}>
                            Back
                        </Button>
                    ) : (
                        <div /> // Spacer
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={loading}
                        variant="love"
                        size="lg"
                        className="px-8"
                    >
                        {loading ? 'Saving...' : step === 3 ? 'Finish' : 'Next'}
                        {!loading && step < 3 && <ArrowRight className="ml-2 w-4 h-4" />}
                        {!loading && step === 3 && <Check className="ml-2 w-4 h-4" />}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
