'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, X, Briefcase, Phone, User, Trash2, Calendar, FileText, CheckSquare, Save, Search, ChevronRight, Edit } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface Company {
  id: string;
  name: string;
  serviceType: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  contractStatus: string | null;
  contractDate: string | null;
  contractDuration: number | null;
  notes: string | null;
  reportFields: string | null; // JSON string e.g. ["contact","contract","notes"]
}

export default function CompaniesPage() {
  const { canCreate, canEdit, canDelete, isSuperAdmin } = useUserPermissions('companies');
  const [companies, setCompanies] = useState<Company[]>([]);


  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tümü');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'reports'>('info');
  
  // Form states
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contractStatus, setContractStatus] = useState('Yok');
  const [contractDate, setContractDate] = useState('');
  const [contractDuration, setContractDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [reportFields, setReportFields] = useState<string[]>(['name', 'serviceType']);

  useEffect(() => {
    let isMounted = true;
    const fetchCompanies = async () => {
      try {
        const res = await ApiClient.get<{ success: boolean; data: Company[] }>('/api/companies');
        if (isMounted && res?.success) setCompanies(res.data);
      } catch (error) {
        console.error('Failed to fetch companies', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCompanies();
    return () => { isMounted = false; };
  }, []);

  const openModal = (comp?: Company) => {
    setActiveModalTab('info');
    if (comp) {
      setEditingId(comp.id);
      setName(comp.name);
      setServiceType(comp.serviceType || '');
      setContactPerson(comp.contactPerson || '');
      setPhone(comp.phone || '');
      setEmail(comp.email || '');
      setContractStatus(comp.contractStatus || 'Yok');
      setContractDate(comp.contractDate ? comp.contractDate.split('T')[0] : '');
      setContractDuration(comp.contractDuration ? comp.contractDuration.toString() : '');
      setNotes(comp.notes || '');
      try {
        setReportFields(JSON.parse(comp.reportFields || '["name","serviceType"]'));
      } catch {
        setReportFields(['name', 'serviceType']);
      }
    } else {
      setEditingId(null);
      setName('');
      setServiceType('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setContractStatus('Yok');
      setContractDate('');
      setContractDuration('');
      setNotes('');
      setReportFields(['name', 'serviceType']);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleReportFieldChange = (field: string) => {
    if (field === 'name' || field === 'serviceType') return;
    setReportFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = { 
        name, serviceType, contactPerson, phone, email,
        contractStatus, contractDate: contractDate || null, contractDuration: contractDuration || null,
        notes, reportFields: JSON.stringify(reportFields)
      };

      if (editingId) {
        const res = await ApiClient.put<{ success: boolean; data: Company }>(`/api/companies`, {
          id: editingId, ...payload
        });
        if (res?.success) {
          setCompanies(companies.map(c => c.id === editingId ? res.data : c));
          closeModal();
        }
      } else {
        const res = await ApiClient.post<{ success: boolean; data: Company }>('/api/companies', payload);
        if (res?.success) {
          setCompanies([...companies, res.data].sort((a, b) => a.name.localeCompare(b.name)));
          closeModal();
        }
      }
    } catch (error) {
      console.error('Failed to save company', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      alert('Bu işlemi yapmaya yetkiniz bulunmamaktadır (Silme Yetkisi Kapalı).');
      return;
    }
    if (!confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/companies?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCompanies(companies.filter(c => c.id !== id));
        closeModal();
      }
    } catch (error) {
      console.error('Failed to delete company', error);
    }
  };


  function formatTitleCase(str: string | undefined | null) {
    if (!str) return '-';
    return str
      .toLocaleLowerCase('tr-TR')
      .split(' ')
      .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
      .join(' ');
  }

  const filteredCompanies = useMemo(() => {
    let result = companies;

    if (activeTab === 'Sözleşmeli') {
      result = result.filter(c => c.contractStatus === 'Var');
    } else if (activeTab === 'Sözleşmesiz') {
      result = result.filter(c => c.contractStatus !== 'Var');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => {
        const nameMatch = (c.name || '').toLowerCase().includes(q);
        const serviceMatch = (c.serviceType || '').toLowerCase().includes(q);
        const contactMatch = (c.contactPerson || '').toLowerCase().includes(q);
        const phoneMatch = (c.phone || '').toLowerCase().includes(q);
        const emailMatch = (c.email || '').toLowerCase().includes(q);
        return nameMatch || serviceMatch || contactMatch || phoneMatch || emailMatch;
      });
    }

    return result;
  }, [companies, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sticky Fixed Header Container */}
      <div className="sticky -top-6 z-30 bg-[#060B14]/95 backdrop-blur-md pt-6 pb-4 border-b border-slate-800/80 -mx-6 px-6 space-y-4 shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-400" />
              Firmalar & Taşeron Yönetimi
            </h1>
            <p className="text-slate-400 text-sm mt-1">Dışarıdan hizmet alınan bakım, onarım, teknik servis ve taşeron firmalar</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap">
              Yönetim Raporu Al (A4 PDF)
            </button>
            {canCreate && (
              <button
                onClick={() => openModal()}
                className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-indigo-900/10 border border-indigo-500/40 hover:bg-indigo-900/30 text-indigo-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Yeni Firma Ekle
              </button>
            )}
          </div>

        </div>

        {/* Search and Tabs Container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('Tümü')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'Tümü' 
                  ? 'text-indigo-400 border-indigo-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Tüm Firmalar
            </button>
            <button
              onClick={() => setActiveTab('Sözleşmeli')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'Sözleşmeli' 
                  ? 'text-indigo-400 border-indigo-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Sözleşmeli ({companies.filter(c => c.contractStatus === 'Var').length})
            </button>
            <button
              onClick={() => setActiveTab('Sözleşmesiz')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'Sözleşmesiz' 
                  ? 'text-indigo-400 border-indigo-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Sözleşmesiz ({companies.filter(c => c.contractStatus !== 'Var').length})
            </button>
          </div>

          {/* Global Multi-Column Search Input Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Firma Adı, Yetkili, Hizmet, Tel ara..."
              className="w-full pl-10 pr-9 py-2 bg-[#070A11] border border-[#151B2B] focus:border-indigo-500 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredCompanies.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
            {searchQuery ? 'Arama kriterlerinize uygun firma bulunamadı.' : 'Henüz kayıtlı servis firması bulunmamaktadır.'}
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div 
              key={company.id}
              onClick={() => openModal(company)}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
              {/* Badges / Boxes Row */}
              <div className="flex items-center justify-between gap-3 flex-1 overflow-x-auto py-1">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center justify-center w-[180px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">FİRMA ADI</span>
                    <span className="text-[13px] font-bold text-white truncate max-w-[170px] px-1">{company.name}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[130px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">HİZMET TÜRÜ</span>
                    <span className="text-[12px] font-bold text-indigo-400 truncate max-w-[120px] px-1">
                      {company.serviceType || 'Genel Servis'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[150px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">YETKİLİ</span>
                    <span className="text-[12px] font-bold text-slate-200 truncate max-w-[140px] px-1">
                      {formatTitleCase(company.contactPerson)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[125px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TELEFON</span>
                    <span className="text-[11px] font-bold font-mono text-amber-500 truncate max-w-[115px] px-1">
                      {company.phone || '-'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[105px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">SÖZLEŞME</span>
                    <span className={`text-[12px] font-bold truncate max-w-[95px] px-1 ${
                      company.contractStatus === 'Var' ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {company.contractStatus === 'Var' ? 'Sözleşmeli' : 'Sözleşmesiz'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[120px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">SÖZLEŞME TARİHİ</span>
                    <span className="text-[11px] font-bold text-cyan-400 truncate max-w-[110px] px-1">
                      {company.contractDate ? new Date(company.contractDate).toLocaleDateString('tr-TR') : '-'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-2">
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(company);
                      }}
                      className="p-2.5 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(company.id);
                      }}
                      className="p-2.5 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(company);
                    }}
                    className="p-2.5 bg-[#070A11] border border-[#151B2B] text-slate-400 hover:text-white hover:border-slate-700 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer"
                    title="Detayları Aç"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAY & DÜZENLE KARTI (MODAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
          <div className="bg-[#0f121b] border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#080b12]">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white flex items-center tracking-wide">
                  <Briefcase className="w-5 h-5 mr-3 text-indigo-500" /> {editingId ? 'Firma Detayları & Düzenle' : 'Yeni Firma Ekle'}
                </h3>
                {editingId && canDelete && (
                  <button onClick={() => handleDelete(editingId)} className="flex items-center px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-colors text-sm font-semibold cursor-pointer" title="Firmayı Sil">
                    <Trash2 className="w-4 h-4 mr-1.5" /> Sil
                  </button>
                )}
              </div>

              <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-slate-800/80 bg-[#080b12] px-4">
              <button 
                onClick={() => setActiveModalTab('info')}
                className={`px-4 py-3 text-sm font-semibold flex items-center border-b-2 transition-colors ${activeModalTab === 'info' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <FileText className="w-4 h-4 mr-2" /> Firma Bilgileri
              </button>
              <button 
                onClick={() => setActiveModalTab('reports')}
                className={`px-4 py-3 text-sm font-semibold flex items-center border-b-2 transition-colors ${activeModalTab === 'reports' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <CheckSquare className="w-4 h-4 mr-2" /> Ay Sonu Yönetim Raporu
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="company-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* INFO TAB */}
                <div className={activeModalTab === 'info' ? 'block space-y-6' : 'hidden'}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Firma Unvanı *</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 transition-all text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hizmet / Uzmanlık Türü</label>
                      <input type="text" value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 transition-all text-sm" />
                    </div>
                  </div>

                  <div className="p-4 border border-slate-800 rounded-xl bg-slate-800/10 space-y-4">
                    <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center"><Calendar className="w-4 h-4 mr-2" /> Sözleşme Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Durum</label>
                        <select value={contractStatus} onChange={(e) => setContractStatus(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm appearance-none">
                          <option value="Var">Sözleşmeli (Var)</option>
                          <option value="Yok">Sözleşmesiz (Yok)</option>
                          <option value="Süresi Doldu">Süresi Doldu</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sözleşme Tarihi</label>
                        <input type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Süresi (Ay)</label>
                        <input type="number" value={contractDuration} onChange={(e) => setContractDuration(e.target.value)} placeholder="Örn: 12" className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Yetkili Kişi</label>
                      <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Telefon</label>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-Posta</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Servis Notları / Kapsam</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Firmanın sağladığı hizmetin genel kapsamı, garanti şartları veya önemli notlar..." className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm resize-none"></textarea>
                  </div>
                </div>

                {/* REPORTS TAB */}
                <div className={activeModalTab === 'reports' ? 'block space-y-6' : 'hidden'}>
                  <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-400/90 leading-relaxed">
                      Yönetime sunulacak &quot;Ay Sonu Raporu&quot; oluşturulurken, bu firmanın hangi bilgilerinin raporda yer alacağını aşağıdan seçebilirsiniz. Firma Unvanı ve Hizmet Türü raporda daima yer alacaktır.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-[#080b12] opacity-50 cursor-not-allowed">
                      <input type="checkbox" checked={true} disabled className="mt-1 bg-slate-800 border-slate-700 rounded text-indigo-500 focus:ring-indigo-500/50" />
                      <div>
                        <span className="block text-sm font-semibold text-white">Firma Adı & Hizmet Türü (Zorunlu)</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Firmanın unvanı ve genel uzmanlık alanı.</span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${reportFields.includes('contract') ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800 bg-[#080b12] hover:border-slate-700'}`}>
                      <input type="checkbox" checked={reportFields.includes('contract')} onChange={() => handleReportFieldChange('contract')} className="mt-1 bg-[#0f121b] border-slate-600 rounded text-indigo-500 focus:ring-indigo-500/50" />
                      <div>
                        <span className="block text-sm font-semibold text-white">Sözleşme Durumu ve Süresi</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Sözleşmenin var olup olmadığı, kalan süresi ve detayları raporda gösterilir.</span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${reportFields.includes('contact') ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800 bg-[#080b12] hover:border-slate-700'}`}>
                      <input type="checkbox" checked={reportFields.includes('contact')} onChange={() => handleReportFieldChange('contact')} className="mt-1 bg-[#0f121b] border-slate-600 rounded text-indigo-500 focus:ring-indigo-500/50" />
                      <div>
                        <span className="block text-sm font-semibold text-white">İletişim / Yetkili Bilgileri</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Yönetimin gerektiğinde firmaya ulaşabilmesi için irtibat kişisi ve telefonu eklenir.</span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${reportFields.includes('notes') ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800 bg-[#080b12] hover:border-slate-700'}`}>
                      <input type="checkbox" checked={reportFields.includes('notes')} onChange={() => handleReportFieldChange('notes')} className="mt-1 bg-[#0f121b] border-slate-600 rounded text-indigo-500 focus:ring-indigo-500/50" />
                      <div>
                        <span className="block text-sm font-semibold text-white">Servis Notları / Kapsam</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Firmayla ilgili girilen özel notlar ve hizmet kapsamı rapora yansıtılır.</span>
                      </div>
                    </label>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800/80 bg-[#080b12] flex items-center justify-end space-x-3">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-slate-800/10 border border-slate-700/50 hover:bg-slate-800/30 text-sm font-semibold text-slate-400 hover:text-slate-300 rounded-lg transition-colors cursor-pointer">
                İptal
              </button>
              {((editingId && canEdit) || (!editingId && canCreate)) && (
                <button form="company-form" type="submit" className="flex items-center px-6 py-2.5 bg-indigo-900/10 border border-indigo-500/50 hover:bg-indigo-900/30 text-indigo-400 text-sm font-bold rounded-lg transition-colors shadow-lg cursor-pointer">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Kaydet' : 'Firmayı Ekle'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
