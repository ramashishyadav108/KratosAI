import React, { useState, useEffect } from 'react';
import './BasicCustomerInfo.css';
import addSquareIcon from '../../assets/Add_square_light.png';
import { customerService } from '../../services/customer.service';

interface OwnershipDirector {
  id: string;
  name: string;
  pan: string;
  dob: string;
  designation: string;
}

interface BasicCustomerInfoProps {
  leadId?: string;
}

interface FormData {
  leadEntity: {
    name: string;
    entityType: string;
    industry: string;
    country: string;
  };
  govRegistrations: {
    pan: string;
    aadhaar: string;
    businessPan: string;
    gstin: string;
    cin: string;
    udyam: string;
  };
  contactDetails: {
    contactPerson: string;
    phoneNumber: string;
    email: string;
  };
  keyPerson: {
    pan: string;
    dob: string;
  };
  addresses: {
    address: string;
    registeredAddress: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const BasicCustomerInfo: React.FC<BasicCustomerInfoProps> = ({ leadId }) => {
  const [applicantType, setApplicantType] = useState<'Individual' | 'Business'>('Individual');
  const [ownershipDirectors, setOwnershipDirectors] = useState<OwnershipDirector[]>([]);
  const [formData, setFormData] = useState<FormData>({
    leadEntity: { name: '', entityType: '', industry: '', country: '' },
    govRegistrations: { pan: '', aadhaar: '', businessPan: '', gstin: '', cin: '', udyam: '' },
    contactDetails: { contactPerson: '', phoneNumber: '', email: '' },
    keyPerson: { pan: '', dob: '' },
    addresses: { address: '', registeredAddress: '', city: '', state: '', pincode: '' }
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [viewMode, setViewMode] = useState(false); // true = view mode, false = edit mode
  const [hasExistingData, setHasExistingData] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      if (!leadId) return;

      try {
        setLoadingData(true);
        console.log('Loading existing data for leadId:', leadId);
        const response = await customerService.getBasicInfo(leadId);

        if (response.success && response.data) {
          const data = response.data;
          console.log('Loaded existing data:', data);

          // Set applicant type
          setApplicantType(data.applicantType === 'INDIVIDUAL' ? 'Individual' : 'Business');

          // Set form data
          setFormData({
            leadEntity: {
              name: data.name || '',
              entityType: data.entityType || '',
              industry: data.industry || '',
              country: data.country || ''
            },
            govRegistrations: {
              pan: data.pan || '',
              aadhaar: data.aadhaar || '',
              businessPan: data.businessPan || '',
              gstin: data.gstin || '',
              cin: data.cin || '',
              udyam: data.udyam || ''
            },
            contactDetails: {
              contactPerson: data.contactPerson || '',
              phoneNumber: data.phoneNumber || '',
              email: data.email || ''
            },
            keyPerson: {
              pan: data.keyPersonPan || '',
              dob: data.keyPersonDob ? new Date(data.keyPersonDob).toISOString().split('T')[0] : ''
            },
            addresses: {
              address: data.address || '',
              registeredAddress: data.registeredAddress || '',
              city: data.city || '',
              state: data.state || '',
              pincode: data.pincode || ''
            }
          });

          // Set ownership directors if they exist
          if (data.ownershipDirectors && Array.isArray(data.ownershipDirectors)) {
            setOwnershipDirectors(
              data.ownershipDirectors.map((director: any) => ({
                id: director.id || Date.now().toString(),
                name: director.name || '',
                pan: director.pan || '',
                dob: director.dob ? new Date(director.dob).toISOString().split('T')[0] : '',
                designation: director.designation || ''
              }))
            );
          }

          // Mark that we have existing data and switch to view mode
          setHasExistingData(true);
          setViewMode(true);
        }
      } catch (err: any) {
        // If no data exists yet (404), that's okay - it's a new record
        if (err.message && !err.message.includes('not found')) {
          console.error('Error loading existing data:', err);
        }
        setHasExistingData(false);
        setViewMode(false);
      } finally {
        setLoadingData(false);
      }
    };

    loadExistingData();
  }, [leadId]);

  const handleInputChange = (
    section: string,
    field: string,
    value: string,
    index?: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof FormData],
        [field]: value
      }
    }));
  };

  const addOwnershipDirector = () => {
    const newDirector: OwnershipDirector = {
      id: Date.now().toString(),
      name: '',
      pan: '',
      dob: '',
      designation: ''
    };
    setOwnershipDirectors([...ownershipDirectors, newDirector]);
  };

  const handleClearData = () => {
    setOwnershipDirectors([]);
    setFormData({
      leadEntity: { name: '', entityType: '', industry: '', country: '' },
      govRegistrations: { pan: '', aadhaar: '', businessPan: '', gstin: '', cin: '', udyam: '' },
      contactDetails: { contactPerson: '', phoneNumber: '', email: '' },
      keyPerson: { pan: '', dob: '' },
      addresses: { address: '', registeredAddress: '', city: '', state: '', pincode: '' }
    });
    setError('');
    setSuccessMessage('');
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Validate Lead & Entity Information
    if (!formData.leadEntity.name.trim()) {
      errors.push(applicantType === 'Individual' ? 'Full Name is required' : 'Business Name is required');
    }
    if (!formData.leadEntity.entityType) {
      errors.push('Entity Type is required');
    }
    if (!formData.leadEntity.industry.trim()) {
      errors.push('Industry is required');
    }
    if (!formData.leadEntity.country.trim()) {
      errors.push('Country is required');
    }

    // Validate Government Registrations based on applicant type
    if (applicantType === 'Individual') {
      if (!formData.govRegistrations.pan.trim()) {
        errors.push('PAN Number is required for Individual applicants');
      }
    } else {
      if (!formData.govRegistrations.businessPan.trim()) {
        errors.push('Business PAN is required for Business applicants');
      }
      if (!formData.govRegistrations.gstin.trim()) {
        errors.push('GSTIN is required for Business applicants');
      }
      if (!formData.govRegistrations.cin.trim()) {
        errors.push('CIN/LLPIN is required for Business applicants');
      }
    }

    // Validate Contact Details
    if (!formData.contactDetails.contactPerson.trim()) {
      errors.push('Contact Person Name is required');
    }
    if (!formData.contactDetails.phoneNumber.trim()) {
      errors.push('Mobile Number is required');
    }
    if (!formData.contactDetails.email.trim()) {
      errors.push('Email Address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactDetails.email)) {
      errors.push('Invalid email format');
    }

    // Validate Key Person Details for Business
    if (applicantType === 'Business') {
      if (!formData.keyPerson.pan.trim()) {
        errors.push('Authorized Person PAN is required for Business applicants');
      }
      if (!formData.keyPerson.dob.trim()) {
        errors.push('Authorized Person DOB is required for Business applicants');
      }
    }

    // Validate Addresses
    if (applicantType === 'Individual') {
      if (!formData.addresses.address.trim()) {
        errors.push('Address is required for Individual applicants');
      }
    } else {
      if (!formData.addresses.registeredAddress.trim()) {
        errors.push('Registered Address is required for Business applicants');
      }
    }
    if (!formData.addresses.city.trim()) {
      errors.push('City is required');
    }
    if (!formData.addresses.state.trim()) {
      errors.push('State is required');
    }
    if (!formData.addresses.pincode.trim()) {
      errors.push('Pincode is required');
    }

    return errors;
  };

  const handleSaveBasicInformation = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      console.log('=== Saving Basic Customer Info ===');
      console.log('Lead ID:', leadId);

      if (!leadId) {
        setError('Lead ID is required');
        setLoading(false);
        return;
      }

      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setLoading(false);
        return;
      }

      // Prepare data for API
      const dataToSave = {
        leadId,
        applicantType: applicantType.toUpperCase() as 'INDIVIDUAL' | 'BUSINESS',
        name: formData.leadEntity.name,
        entityType: formData.leadEntity.entityType || undefined,
        industry: formData.leadEntity.industry || undefined,
        country: formData.leadEntity.country || undefined,

        // Government Registrations
        ...(applicantType === 'Individual' ? {
          pan: formData.govRegistrations.pan || undefined,
          aadhaar: formData.govRegistrations.aadhaar || undefined,
        } : {
          businessPan: formData.govRegistrations.businessPan || undefined,
          gstin: formData.govRegistrations.gstin || undefined,
          cin: formData.govRegistrations.cin || undefined,
          udyam: formData.govRegistrations.udyam || undefined,
        }),

        // Contact Details
        contactPerson: formData.contactDetails.contactPerson || undefined,
        phoneNumber: formData.contactDetails.phoneNumber || undefined,
        email: formData.contactDetails.email || undefined,

        // Key Person (Business only)
        ...(applicantType === 'Business' && {
          keyPersonPan: formData.keyPerson.pan || undefined,
          keyPersonDob: formData.keyPerson.dob || undefined,
        }),

        // Addresses
        ...(applicantType === 'Individual' ? {
          address: formData.addresses.address || undefined,
        } : {
          registeredAddress: formData.addresses.registeredAddress || undefined,
        }),
        city: formData.addresses.city || undefined,
        state: formData.addresses.state || undefined,
        pincode: formData.addresses.pincode || undefined,

        // Ownership Directors
        ownershipDirectors: ownershipDirectors.length > 0 ? ownershipDirectors.map(director => ({
          name: director.name,
          pan: director.pan,
          dob: director.dob || undefined,
          designation: director.designation
        })) : undefined
      };

      console.log('Data to save:', JSON.stringify(dataToSave, null, 2));

      const response = await customerService.saveBasicInfo(dataToSave);

      console.log('Response:', response);

      if (response.success) {
        setSuccessMessage('Basic information saved successfully!');
        console.log('Saved data:', response.data);
        // Switch to view mode after successful save
        setHasExistingData(true);
        setViewMode(true);
      }
    } catch (err: any) {
      console.error('Error saving basic information:', err);

      let errorMessage = 'Failed to save basic information. Please try again.';

      if (err.errors && Array.isArray(err.errors)) {
        errorMessage = err.errors.join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render view mode when data exists
  if (viewMode && hasExistingData) {
    return (
      <div className="basic-customer-info">
        <div className="form-container">
          {/* Header with Edit Button */}
          <div className="view-header">
            <h2 className="view-title">Customer Basic Information</h2>
            <button className="edit-button" onClick={() => setViewMode(false)}>
              Edit Details
            </button>
          </div>

          {/* Lead & Entity Information */}
          <div className="view-section">
            <h3 className="view-section-title">
              Lead & Entity Information
            </h3>
            <div className="view-grid">
              <div>
                <div className="view-label">Applicant Type</div>
                <div className="view-value">{applicantType}</div>
              </div>
              <div>
                <div className="view-label">
                  {applicantType === 'Individual' ? 'Full Name' : 'Business Name'}
                </div>
                <div className="view-value">{formData.leadEntity.name || '-'}</div>
              </div>
              <div>
                <div className="view-label">Entity Type</div>
                <div className="view-value">{formData.leadEntity.entityType || '-'}</div>
              </div>
              <div>
                <div className="view-label">Industry</div>
                <div className="view-value">{formData.leadEntity.industry || '-'}</div>
              </div>
              <div>
                <div className="view-label">Country</div>
                <div className="view-value">{formData.leadEntity.country || '-'}</div>
              </div>
            </div>
          </div>

          {/* Government Registrations */}
          <div className="view-section">
            <h3 className="view-section-title">
              Government Registrations
            </h3>
            <div className="view-grid">
              {applicantType === 'Individual' ? (
                <>
                  <div>
                    <div className="view-label">PAN Number</div>
                    <div className="view-value">{formData.govRegistrations.pan || '-'}</div>
                  </div>
                  <div>
                    <div className="view-label">Aadhaar Number</div>
                    <div className="view-value">{formData.govRegistrations.aadhaar || '-'}</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="view-label">Business PAN</div>
                    <div className="view-value">{formData.govRegistrations.businessPan || '-'}</div>
                  </div>
                  <div>
                    <div className="view-label">GSTIN</div>
                    <div className="view-value">{formData.govRegistrations.gstin || '-'}</div>
                  </div>
                  <div>
                    <div className="view-label">CIN / LLPIN</div>
                    <div className="view-value">{formData.govRegistrations.cin || '-'}</div>
                  </div>
                  <div>
                    <div className="view-label">Udyam Number</div>
                    <div className="view-value">{formData.govRegistrations.udyam || '-'}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="view-section">
            <h3 className="view-section-title">
              Contact Details
            </h3>
            <div className="view-grid">
              <div>
                <div className="view-label">Contact Person</div>
                <div className="view-value">{formData.contactDetails.contactPerson || '-'}</div>
              </div>
              <div>
                <div className="view-label">Mobile Number</div>
                <div className="view-value">{formData.contactDetails.phoneNumber || '-'}</div>
              </div>
              <div>
                <div className="view-label">Email Address</div>
                <div className="view-value">{formData.contactDetails.email || '-'}</div>
              </div>
            </div>
          </div>

          {/* Key Person Details (for Business) */}
          {applicantType === 'Business' && (
            <div className="view-section">
              <h3 className="view-section-title">
                Key Person Details
              </h3>
              <div className="view-grid">
                <div>
                  <div className="view-label">Authorized Person PAN</div>
                  <div className="view-value">{formData.keyPerson.pan || '-'}</div>
                </div>
                <div>
                  <div className="view-label">Authorized Person DOB</div>
                  <div className="view-value">{formData.keyPerson.dob || '-'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Addresses */}
          <div className="view-section">
            <h3 className="view-section-title">
              Addresses
            </h3>
            <div className="view-grid">
              <div>
                <div className="view-label">
                  {applicantType === 'Individual' ? 'Address' : 'Registered Address'}
                </div>
                <div className="view-value">
                  {applicantType === 'Individual' ? formData.addresses.address || '-' : formData.addresses.registeredAddress || '-'}
                </div>
              </div>
              <div>
                <div className="view-label">City</div>
                <div className="view-value">{formData.addresses.city || '-'}</div>
              </div>
              <div>
                <div className="view-label">State</div>
                <div className="view-value">{formData.addresses.state || '-'}</div>
              </div>
              <div>
                <div className="view-label">Pincode</div>
                <div className="view-value">{formData.addresses.pincode || '-'}</div>
              </div>
            </div>
          </div>

          {/* Ownership/Directors */}
          {ownershipDirectors.length > 0 && (
            <div className="view-section">
              <h3 className="view-section-title">
                Ownership/Directors
              </h3>
              {ownershipDirectors.map((director) => (
                <div key={director.id} className="director-card">
                  <div className="view-grid">
                    <div>
                      <div className="view-label">Name</div>
                      <div className="view-value">{director.name || '-'}</div>
                    </div>
                    <div>
                      <div className="view-label">PAN</div>
                      <div className="view-value">{director.pan || '-'}</div>
                    </div>
                    <div>
                      <div className="view-label">DOB</div>
                      <div className="view-value">{director.dob || '-'}</div>
                    </div>
                    <div>
                      <div className="view-label">Designation</div>
                      <div className="view-value">{director.designation || '-'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render edit/create form
  return (
    <div className="basic-customer-info">
      <div className="form-container">
        {loadingData && (
          <div style={{
            padding: '12px',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            borderRadius: '4px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Loading existing data...
          </div>
        )}

        {/* Lead & Entity Information */}
        <h3 className="section-title">
          Lead & Entity Information
          <span className="info-icon" data-tooltip="Identify whether it's a person or a company">ⓘ</span>
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <select
              className="form-input"
              value={applicantType}
              onChange={(e) => setApplicantType(e.target.value as 'Individual' | 'Business')}
            >
              <option value="Individual">Applicant Type: Individual *</option>
              <option value="Business">Applicant Type: Business *</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder={applicantType === 'Individual' ? 'Full Name *' : 'Business Name *'}
              className="form-input"
              value={formData.leadEntity.name}
              onChange={(e) => handleInputChange('leadEntity', 'name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              className="form-input"
              value={formData.leadEntity.entityType}
              onChange={(e) => handleInputChange('leadEntity', 'entityType', e.target.value)}
            >
              <option value="">Entity Type *</option>
              <option value="Individual">Individual</option>
              <option value="Proprietorship">Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Pvt Ltd">Pvt Ltd</option>
              <option value="LLP">LLP</option>
              <option value="Public Ltd">Public Ltd</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Industry *"
              className="form-input"
              value={formData.leadEntity.industry}
              onChange={(e) => handleInputChange('leadEntity', 'industry', e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Country *"
              className="form-input"
              value={formData.leadEntity.country}
              onChange={(e) => handleInputChange('leadEntity', 'country', e.target.value)}
            />
          </div>
        </div>

        {/* Government Registrations */}
        <h3 className="section-title">
          Government Registrations
          <span className="info-icon" data-tooltip="For individual or business KYC verification">ⓘ</span>
        </h3>

        {applicantType === 'Individual' ? (
          <div className="form-grid">
            <div className="form-group">
              <input
                type="text"
                placeholder="PAN Number *"
                className="form-input"
                onChange={(e) => handleInputChange('govRegistrations', 'pan', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Aadhaar Number (optional)"
                className="form-input"
                onChange={(e) => handleInputChange('govRegistrations', 'aadhaar', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="form-grid">
            <div className="form-group">
              <input
                type="text"
                placeholder="Business PAN *"
                className="form-input"
                onChange={(e) => handleInputChange('govRegistrations', 'businessPan', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="GSTIN *"
                className="form-input"
                onChange={(e) => handleInputChange('govRegistrations', 'gstin', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="CIN / LLPIN *"
                className="form-input"
                onChange={(e) => handleInputChange('govRegistrations', 'cin', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Udyam Number (optional)"
                className="form-input"
                onChange={(e) => handleInputChange('govRegistrations', 'udyam', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Contact Details */}
        <h3 className="section-title">
          Contact Details
          <span className="info-icon" data-tooltip="Works for both individuals and companies">ⓘ</span>
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <input
              type="text"
              placeholder="Contact Person Name *"
              className="form-input"
              value={formData.contactDetails.contactPerson}
              onChange={(e) => handleInputChange('contactDetails', 'contactPerson', e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Mobile Number *"
              className="form-input"
              value={formData.contactDetails.phoneNumber}
              onChange={(e) => handleInputChange('contactDetails', 'phoneNumber', e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address *"
              className="form-input"
              value={formData.contactDetails.email}
              onChange={(e) => handleInputChange('contactDetails', 'email', e.target.value)}
            />
          </div>
        </div>

        {/* Key Person Details (for Business) */}
        {applicantType === 'Business' && (
          <>
            <h3 className="section-title">
              Key Person Details
              <span className="info-icon" data-tooltip="Needed for credit + KYC of owners">ⓘ</span>
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Authorized Person PAN *"
                  className="form-input"
                  onChange={(e) => handleInputChange('keyPerson', 'pan', e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Authorized Person DOB *"
                  className="form-input"
                  onFocus={(e) => e.target.type = 'date'}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.type = 'text';
                    }
                  }}
                  onChange={(e) => handleInputChange('keyPerson', 'dob', e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Addresses */}
        <h3 className="section-title">Addresses</h3>
        {applicantType === 'Individual' ? (
          <div className="form-grid">
            <div className="form-group">
              <input
                type="text"
                placeholder="Address *"
                className="form-input"
                onChange={(e) => handleInputChange('addresses', 'address', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="City *"
                className="form-input"
                onChange={(e) => handleInputChange('addresses', 'city', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="State *"
                className="form-input"
                onChange={(e) => handleInputChange('addresses', 'state', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Pincode *"
                className="form-input"
                onChange={(e) => handleInputChange('addresses', 'pincode', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="form-grid">
            <div className="form-group">
              <input
                type="text"
                placeholder="Registered Address *"
                className="form-input"
                onChange={(e) => handleInputChange('addresses', 'registeredAddress', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="City *"
                className="form-input"
                onChange={(e) => handleInputChange('addresses', 'city', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="State *"
                className="form-input"
                onChange={(e) => handleInputChange('addresses', 'state', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Pincode *"
                className="form-input"
                onChange={(e) => handleInputChange('addresses', 'pincode', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Ownership/Directors */}
        <h3 className="section-title">
          Ownership
          <span className="info-icon" data-tooltip="For business loans and mandatory for sanctions screening">ⓘ</span>
        </h3>

        {ownershipDirectors.map((director, index) => (
          <div key={director.id} className="form-grid ownership-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="Director / Partner / Owner Name *"
                className="form-input"
                value={director.name}
                onChange={(e) => {
                  const newDirectors = [...ownershipDirectors];
                  newDirectors[index].name = e.target.value;
                  setOwnershipDirectors(newDirectors);
                }}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Director/Owner PAN *"
                className="form-input"
                value={director.pan}
                onChange={(e) => {
                  const newDirectors = [...ownershipDirectors];
                  newDirectors[index].pan = e.target.value;
                  setOwnershipDirectors(newDirectors);
                }}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Director/Owner DOB *"
                className="form-input"
                value={director.dob}
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.type = 'text';
                  }
                }}
                onChange={(e) => {
                  const newDirectors = [...ownershipDirectors];
                  newDirectors[index].dob = e.target.value;
                  setOwnershipDirectors(newDirectors);
                }}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Designation *"
                className="form-input"
                value={director.designation}
                onChange={(e) => {
                  const newDirectors = [...ownershipDirectors];
                  newDirectors[index].designation = e.target.value;
                  setOwnershipDirectors(newDirectors);
                }}
              />
            </div>
          </div>
        ))}

        <div className="form-grid">
          <div className="form-group">
            <button className="add-person-btn" onClick={addOwnershipDirector}>
              <img src={addSquareIcon} alt="Add" className="add-icon" />
              Add Director/Owner
            </button>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
              ⚠️ Please fix the following errors:
            </div>
            <ul style={{
              margin: '0',
              paddingLeft: '20px',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              {error.split(', ').map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {successMessage && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #a7f3d0',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ✅ {successMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="form-actions">
          <button className="btn-clear" onClick={handleClearData} disabled={loading}>
            Clear Data
          </button>
          <button className="btn-save" onClick={handleSaveBasicInformation} disabled={loading}>
            {loading ? 'Saving...' : 'Save Basic Information'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicCustomerInfo;
