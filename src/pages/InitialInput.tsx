
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Check, ChevronRight, ChevronLeft } from "lucide-react";

const InitialInput = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<string>("medications");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState({
    medications: false,
    provider: false,
    family: false,
  });
  
  // Form states
  const [medications, setMedications] = useState([
    { id: 1, name: "", dosage: "", frequency: "" }
  ]);
  
  const [provider, setProvider] = useState({
    name: "",
    specialty: "",
    phone: "",
  });
  
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: "", relationship: "", phone: "" }
  ]);
  
  // Personal info for patient record
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    dob: "",
    gender: "",
    contact: "",
    address: "",
    medicalHistory: "",
    lifestyleFactors: ""
  });
  
  useEffect(() => {
    // If user metadata contains a username, use it as default name
    if (user?.user_metadata?.username) {
      setPatientInfo(prev => ({
        ...prev,
        name: user.user_metadata.username
      }));
    }
  }, [user]);
  
  // Handle medication form
  const addMedication = () => {
    setMedications([
      ...medications,
      { id: Date.now(), name: "", dosage: "", frequency: "" }
    ]);
  };
  
  const updateMedication = (id: number, field: string, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };
  
  const removeMedication = (id: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };
  
  // Handle family member form
  const addFamilyMember = () => {
    setFamilyMembers([
      ...familyMembers,
      { id: Date.now(), name: "", relationship: "", phone: "" }
    ]);
  };
  
  const updateFamilyMember = (id: number, field: string, value: string) => {
    setFamilyMembers(familyMembers.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };
  
  const removeFamilyMember = (id: number) => {
    if (familyMembers.length > 1) {
      setFamilyMembers(familyMembers.filter(member => member.id !== id));
    }
  };

  // Update patient info
  const updatePatientInfo = (field: string, value: string) => {
    setPatientInfo({
      ...patientInfo,
      [field]: value
    });
  };
  
  // Validate and mark step as complete
  const validateMedications = () => {
    // Allow empty medications
    if (medications.length === 1 && !medications[0].name) {
      setIsComplete(prev => ({ ...prev, medications: true }));
      return true;
    }
    
    // If medications are entered, ensure they have name and frequency
    const isValid = medications.every(med => {
      return !med.name || (med.name && med.frequency);
    });
    
    if (!isValid) {
      toast.error("Please provide at least a name and frequency for each medication");
      return false;
    }
    
    setIsComplete(prev => ({ ...prev, medications: true }));
    return true;
  };
  
  const validateProvider = () => {
    // Provider is optional
    if (!provider.name) {
      setIsComplete(prev => ({ ...prev, provider: true }));
      return true;
    }
    
    // If provider name is entered, phone should also be provided
    if (provider.name && !provider.phone) {
      toast.error("Please provide a phone number for your healthcare provider");
      return false;
    }
    
    setIsComplete(prev => ({ ...prev, provider: true }));
    return true;
  };
  
  const validateFamily = () => {
    // Allow empty family members
    if (familyMembers.length === 1 && !familyMembers[0].name) {
      setIsComplete(prev => ({ ...prev, family: true }));
      return true;
    }
    
    // If family members are entered, ensure they have name and phone
    const isValid = familyMembers.every(member => {
      return !member.name || (member.name && member.phone);
    });
    
    if (!isValid) {
      toast.error("Please provide at least a name and phone number for each family member");
      return false;
    }
    
    setIsComplete(prev => ({ ...prev, family: true }));
    return true;
  };

  const validatePatientInfo = () => {
    if (!patientInfo.name || !patientInfo.dob || !patientInfo.contact) {
      toast.error("Please provide your name, date of birth, and contact information");
      return false;
    }
    return true;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep === "medications") {
      if (validateMedications()) {
        setCurrentStep("provider");
      }
    } else if (currentStep === "provider") {
      if (validateProvider()) {
        setCurrentStep("family");
      }
    }
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep === "family") {
      setCurrentStep("provider");
    } else if (currentStep === "provider") {
      setCurrentStep("medications");
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFamily() || !validatePatientInfo()) {
      return;
    }
    
    if (!user) {
      toast.error("User not authenticated");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Insert Patient record if it doesn't exist
      const { data: patientData, error: patientCheckError } = await supabase
        .from('patients')
        .select('patientid')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let patientId;
      
      if (!patientData) {
        // Create new patient record
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            name: patientInfo.name,
            dob: patientInfo.dob,
            gender: patientInfo.gender || null,
            contact: patientInfo.contact,
            address: patientInfo.address || null,
            medicalhistory: patientInfo.medicalHistory || null,
            lifestylefactors: patientInfo.lifestyleFactors || null
          })
          .select('patientid')
          .single();
          
        if (patientError) throw patientError;
        patientId = newPatient.patientid;
      } else {
        patientId = patientData.patientid;
      }
      
      // 2. Insert treatments (medications)
      const validMedications = medications.filter(med => med.name);
      if (validMedications.length > 0) {
        const medicationsToInsert = validMedications.map(med => ({
          patientid: patientId,
          treatmenttype: 'Medication',
          medication: med.name,
          therapy: `${med.dosage || 'No dosage'} - ${med.frequency}`,
        }));
        
        const { error: medicationError } = await supabase
          .from('treatments')
          .insert(medicationsToInsert);
          
        if (medicationError) throw medicationError;
      }
      
      // 3. Insert healthcare provider
      if (provider.name) {
        const { error: providerError } = await supabase
          .from('healthcareproviders')
          .insert({
            name: provider.name,
            specialization: provider.specialty || 'General',
            contact: provider.phone
          });
          
        if (providerError) throw providerError;
      }
      
      // 4. Insert family members
      const validFamilyMembers = familyMembers.filter(member => member.name);
      if (validFamilyMembers.length > 0) {
        const familyToInsert = validFamilyMembers.map(member => ({
          patientid: patientId,
          name: member.name,
          relationship: member.relationship || 'Not specified',
          contact: member.phone
        }));
        
        const { error: familyError } = await supabase
          .from('familymembers')
          .insert(familyToInsert);
          
        if (familyError) throw familyError;
      }
      
      toast.success("Initial information saved successfully!");
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving initial data:", error);
      toast.error(error.message || "Failed to save information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to RecoverTrack</CardTitle>
          <CardDescription>
            Please provide some initial information to help us personalize your recovery journey. You can update this information later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="medications" disabled={currentStep !== "medications"}>
                <div className="flex items-center">
                  {isComplete.medications && <Check className="mr-2 h-4 w-4" />}
                  <span>Medications</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="provider" disabled={currentStep !== "provider"}>
                <div className="flex items-center">
                  {isComplete.provider && <Check className="mr-2 h-4 w-4" />}
                  <span>Provider</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="family" disabled={currentStep !== "family"}>
                <div className="flex items-center">
                  {isComplete.family && <Check className="mr-2 h-4 w-4" />}
                  <span>Family</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            {/* Patient information - shown on all tabs */}
            <div className="mt-6 mb-8 p-4 border border-border rounded-md">
              <h3 className="text-lg font-medium mb-4">Your Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="patient-name"
                    value={patientInfo.name}
                    onChange={(e) => updatePatientInfo("name", e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-dob">Date of Birth <span className="text-red-500">*</span></Label>
                  <Input
                    id="patient-dob"
                    type="date"
                    value={patientInfo.dob}
                    onChange={(e) => updatePatientInfo("dob", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-gender">Gender</Label>
                  <Input
                    id="patient-gender"
                    value={patientInfo.gender}
                    onChange={(e) => updatePatientInfo("gender", e.target.value)}
                    placeholder="Gender"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-contact">Contact Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="patient-contact"
                    value={patientInfo.contact}
                    onChange={(e) => updatePatientInfo("contact", e.target.value)}
                    placeholder="Phone number"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="patient-address">Address</Label>
                  <Input
                    id="patient-address"
                    value={patientInfo.address}
                    onChange={(e) => updatePatientInfo("address", e.target.value)}
                    placeholder="Your address"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="patient-medical">Medical History</Label>
                  <Input
                    id="patient-medical"
                    value={patientInfo.medicalHistory}
                    onChange={(e) => updatePatientInfo("medicalHistory", e.target.value)}
                    placeholder="Relevant medical history"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="patient-lifestyle">Lifestyle Factors</Label>
                  <Input
                    id="patient-lifestyle"
                    value={patientInfo.lifestyleFactors}
                    onChange={(e) => updatePatientInfo("lifestyleFactors", e.target.value)}
                    placeholder="Diet, exercise, etc."
                  />
                </div>
              </div>
            </div>
            
            <TabsContent value="medications" className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Current Medications & Treatments</h3>
                <p className="text-sm text-muted-foreground">
                  List any medications or treatments you're currently taking
                </p>
              </div>
              
              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={medication.id} className="p-4 border border-border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Medication {index + 1}</h4>
                      {medications.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeMedication(medication.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor={`med-name-${medication.id}`}>Name</Label>
                        <Input
                          id={`med-name-${medication.id}`}
                          value={medication.name}
                          onChange={(e) => updateMedication(medication.id, "name", e.target.value)}
                          placeholder="e.g., Ibuprofen"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`med-dosage-${medication.id}`}>Dosage (optional)</Label>
                        <Input
                          id={`med-dosage-${medication.id}`}
                          value={medication.dosage}
                          onChange={(e) => updateMedication(medication.id, "dosage", e.target.value)}
                          placeholder="e.g., 200mg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`med-freq-${medication.id}`}>Frequency</Label>
                        <Input
                          id={`med-freq-${medication.id}`}
                          value={medication.frequency}
                          onChange={(e) => updateMedication(medication.id, "frequency", e.target.value)}
                          placeholder="e.g., 3x daily"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={addMedication}
                >
                  Add Another Medication
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="provider" className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Healthcare Provider</h3>
                <p className="text-sm text-muted-foreground">
                  Your primary doctor or specialist for this recovery
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-name">Provider Name</Label>
                  <Input
                    id="provider-name"
                    value={provider.name}
                    onChange={(e) => setProvider({ ...provider, name: e.target.value })}
                    placeholder="e.g., Dr. Sarah Smith"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="provider-specialty">Specialty (optional)</Label>
                  <Input
                    id="provider-specialty"
                    value={provider.specialty}
                    onChange={(e) => setProvider({ ...provider, specialty: e.target.value })}
                    placeholder="e.g., Orthopedic Surgeon"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="provider-phone">Phone Number</Label>
                  <Input
                    id="provider-phone"
                    value={provider.phone}
                    onChange={(e) => setProvider({ ...provider, phone: e.target.value })}
                    placeholder="e.g., 555-123-4567"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="family" className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Family & Emergency Contacts</h3>
                <p className="text-sm text-muted-foreground">
                  People to contact in case of emergency
                </p>
              </div>
              
              <div className="space-y-4">
                {familyMembers.map((member, index) => (
                  <div key={member.id} className="p-4 border border-border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Contact {index + 1}</h4>
                      {familyMembers.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFamilyMember(member.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor={`family-name-${member.id}`}>Name</Label>
                        <Input
                          id={`family-name-${member.id}`}
                          value={member.name}
                          onChange={(e) => updateFamilyMember(member.id, "name", e.target.value)}
                          placeholder="e.g., Jane Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`family-rel-${member.id}`}>Relationship</Label>
                        <Input
                          id={`family-rel-${member.id}`}
                          value={member.relationship}
                          onChange={(e) => updateFamilyMember(member.id, "relationship", e.target.value)}
                          placeholder="e.g., Spouse"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`family-phone-${member.id}`}>Phone</Label>
                        <Input
                          id={`family-phone-${member.id}`}
                          value={member.phone}
                          onChange={(e) => updateFamilyMember(member.id, "phone", e.target.value)}
                          placeholder="e.g., 555-987-6543"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={addFamilyMember}
                >
                  Add Another Contact
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep !== "medications" ? (
            <Button variant="outline" onClick={handlePreviousStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          ) : (
            <div></div> // Empty div to maintain spacing
          )}
          
          {currentStep !== "family" ? (
            <Button onClick={handleNextStep}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default InitialInput;
