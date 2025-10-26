import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchApplications, fetchDocuments, selectDashboard } from '../store/dashboardSlice';
import PageTransition from '../components/PageTransition';
import vibeBg from '../assets/vibe-bg3.png';
import {
  ArticleOutlined,
  PendingActionsOutlined,
  CheckCircleOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  RemoveOutlined,
  FolderOpenOutlined,
  WarningAmberOutlined,
  PictureAsPdfOutlined,
  AddOutlined,
  VisibilityOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ArrowBack,
  FlightTakeoff as FlightTakeoffIcon,
  ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import { CircularProgress as MuiCircularProgress } from '@mui/material';

const countryData = {
  DE: { name: 'Almanya', flag: '🇩🇪' },
  FR: { name: 'Fransa', flag: '🇫🇷' },
  GB: { name: 'İngiltere', flag: '🇬🇧' },
  NL: { name: 'Hollanda', flag: '🇳🇱' },
  US: { name: 'Amerika', flag: '🇺🇸' },
  // Add other countries as needed
  default: { name: 'Bilinmeyen Ülke', flag: '🏳️' },
};

const getCountryInfo = (code) => {
  const upperCode = code?.toUpperCase();
  return countryData[upperCode] || countryData.default;
};

const formatApiDate = (dateString) => {
  if (!dateString) return 'Tarih bilgisi yok';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const mapApplicationData = (app) => {
  const countryInfo = getCountryInfo(app.country_code);
  const totalItems = app.application_steps?.length || 1;
  // This is a placeholder until step completion is available in the API
  const completedItems = app.application_steps?.filter(s => s.status === 'COMPLETED').length || 0;

  return {
    id: app.app_id,
    country: countryInfo.name,
    flag: countryInfo.flag,
    visaType: app.travel_purpose || 'Vize Başvurusu',
    status: app.status === 'DRAFT' ? 'in_progress' : (app.status?.toLowerCase() || 'in_progress'),
    approvalScore: Math.round((completedItems / totalItems) * 100) || 0, // Placeholder score
    completedItems: completedItems,
    totalItems: totalItems,
    lastUpdated: formatApiDate(app.updated_at),
  };
};

const mapDocumentData = (doc) => {
  const pathParts = doc.storage_path.split('/');
  const filename = pathParts.pop() || 'dosya';
  const fileExtension = filename.split('.').pop()?.toLowerCase();

  let type = 'other';
  if (['pdf', 'doc', 'docx'].includes(fileExtension)) type = 'document';
  if (['jpg', 'jpeg', 'png'].includes(fileExtension)) type = 'image';


  return {
    id: doc.doc_id,
    name: filename,
    type: type, // API doesn't provide this, so we default
    size: 'N/A', // API doesn't provide this
    uploadDate: formatApiDate(doc.created_at),
    expiryDate: null, // API doesn't provide this
  };
};


/**
 * Circular Progress Component for Approval Score
 */
const CircularProgress = ({ score, size = 120 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Color based on score
  const getColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out',
            filter: `drop-shadow(0 0 6px ${getColor()}40)`,
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: getColor(),
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard = ({ icon, title, value, subtitle, trend }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUpOutlined style={{ fontSize: 16, color: '#10b981' }} />;
    if (trend === 'down') return <TrendingDownOutlined style={{ fontSize: 16, color: '#ef4444' }} />;
    return <RemoveOutlined style={{ fontSize: 16, color: '#6b7280' }} />;
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.6)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{icon}</div>
        {trend && getTrendIcon()}
      </div>
      <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.75rem', color: '#9ca3af' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

/**
 * Application Card Component
 */
const ApplicationCard = ({ application, onClick }) => {
  const getStatusColor = () => {
    switch (application.status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'submitted': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (application.status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'submitted': return 'Gönderildi';
      default: return 'Beklemede';
    }
  };

  const progressPercentage = (application.completedItems / application.totalItems) * 100;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '1.75rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.6)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.015)';
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>{application.flag}</span>
          <div>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.125rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
              {application.country}
            </h3>
            <span
              style={{
                display: 'inline-block',
                marginTop: '0.25rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '50px',
                backgroundColor: '#f0fdf4',
                color: '#064e3b',
                fontSize: '0.75rem',
                fontWeight: '600',
                fontFamily: '"Playfair Display", serif',
              }}
            >
              {application.visaType}
            </span>
          </div>
        </div>
        <span
          style={{
            padding: '0.375rem 0.875rem',
            borderRadius: '50px',
            backgroundColor: `${getStatusColor()}15`,
            color: getStatusColor(),
            fontSize: '0.75rem',
            fontWeight: '600',
            fontFamily: '"Playfair Display", serif',
          }}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Approval Score & Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
            Belge Tamamlanma
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '8px', backgroundColor: '#e5e7eb', borderRadius: '50px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercentage}%`,
                  backgroundColor: '#10b981',
                  borderRadius: '50px',
                  transition: 'width 0.5s ease-in-out',
                }}
              />
            </div>
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>
              {application.completedItems}/{application.totalItems}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: '1.5rem' }}>
          <CircularProgress score={application.approvalScore} size={100} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
        <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.75rem', color: '#9ca3af' }}>
          {application.lastUpdated}
        </span>
        <button
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            border: 'none',
            fontFamily: '"Playfair Display", serif',
            fontSize: '0.875rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
          }}
        >
          Detaylara Git
        </button>
      </div>
    </div>
  );
};

/**
 * Document Item Component
 */
const DocumentItem = ({ document }) => {
  const getTypeColor = () => {
    switch (document.type) {
      case 'passport': return '#3b82f6';
      case 'financial': return '#10b981';
      case 'education': return '#a855f7';
      case 'employment': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeText = () => {
    switch (document.type) {
      case 'passport': return 'Pasaport';
      case 'financial': return 'Finansal';
      case 'education': return 'Eğitim';
      case 'employment': return 'İş';
      default: return 'Diğer';
    }
  };

  const isExpiringSoon = document.expiryDate && new Date(document.expiryDate) - new Date() < 30 * 24 * 60 * 60 * 1000;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.125rem',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(240, 253, 244, 0.95)';
        e.currentTarget.style.borderColor = '#10b981';
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.1)';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <PictureAsPdfOutlined style={{ fontSize: 28, color: '#ef4444' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>
              {document.name}
            </span>
            <span
              style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '50px',
                backgroundColor: `${getTypeColor()}15`,
                color: getTypeColor(),
                fontSize: '0.65rem',
                fontWeight: '600',
                fontFamily: '"Playfair Display", serif',
              }}
            >
              {getTypeText()}
            </span>
            {isExpiringSoon && (
              <span
                style={{
                  padding: '0.125rem 0.5rem',
                  borderRadius: '50px',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  fontFamily: '"Playfair Display", serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <WarningAmberOutlined style={{ fontSize: 12 }} />
                Yakında Dolacak
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
            <span>{document.size}</span>
            <span>•</span>
            <span>{document.uploadDate}</span>
            {document.expiryDate && (
              <>
                <span>•</span>
                <span>Son Geçerlilik: {document.expiryDate}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#f0fdf4',
            color: '#10b981',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dcfce7';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f0fdf4';
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('View:', document.name);
          }}
        >
          <VisibilityOutlined style={{ fontSize: 16 }} />
        </button>
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#f0fdf4',
            color: '#10b981',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dcfce7';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f0fdf4';
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Download:', document.name);
          }}
        >
          <DownloadOutlined style={{ fontSize: 16 }} />
        </button>
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#fef2f2',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fee2e2';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#fef2f2';
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Delete:', document.name);
          }}
        >
          <DeleteOutlined style={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
};

/**
 * Dashboard Page Component
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    applications: rawApplications,
    documents: rawDocuments,
    status,
    error
  } = useSelector(selectDashboard);

  useEffect(() => {
    dispatch(fetchApplications());
    dispatch(fetchDocuments());
  }, [dispatch]);

  const applications = Array.isArray(rawApplications) ? rawApplications.map(mapApplicationData) : [];
  const documents = Array.isArray(rawDocuments) ? rawDocuments.map(mapDocumentData) : [];

  // TODO: Replace with real data transformations once API is integrated
  const totalApplications = applications.length;
  const inProgressApplications = applications.filter(app => app.status === 'in_progress').length;
  const completedApplications = applications.filter(app => app.status === 'completed').length;
  const totalDocuments = documents.length;
  const expiringSoonDocuments = documents.filter(doc =>
    doc.expiryDate && new Date(doc.expiryDate) - new Date() < 30 * 24 * 60 * 60 * 1000
  ).length;


  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0fdf4' }}>
        <MuiCircularProgress size={60} sx={{ color: '#10b981' }} />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#fef2f2', padding: '2rem' }}>
        <ErrorOutlineIcon sx={{ fontSize: 64, color: '#ef4444', marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: '"Playfair Display", serif', color: '#ef4444', marginBottom: '0.5rem' }}>Bir Hata Oluştu</h2>
        <p style={{ fontFamily: '"Playfair Display", serif', color: '#b91c1c', marginBottom: '1.5rem', textAlign: 'center' }}>
          {error || 'Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.'}
        </p>
        <button
          onClick={() => {
            dispatch(fetchApplications());
            dispatch(fetchDocuments());
          }}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '50px',
            border: 'none',
            fontFamily: '"Playfair Display", serif',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          backgroundImage: `url(${vibeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          position: 'relative',
          padding: '2rem',
          paddingTop: '5rem',
        }}
      >
        {/* Soft overlay for better contrast */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Back Button & Visa Flow Branding */}
        <div style={{
          position: 'fixed',
          top: '2rem',
          left: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 1000
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
            }}
          >
            <ArrowBack style={{ fontSize: 24 }} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              fontStyle: 'italic',
              fontSize: '2rem',
              color: '#064E3B',
              fontWeight: '400',
              textShadow: '0 2px 10px rgba(255, 255, 255, 0.8)'
            }}>
              visa flow
            </span>
            <FlightTakeoffIcon sx={{ 
              fontSize: 32, 
              color: '#064E3B',
              paddingTop: '0.3rem',
              filter: 'drop-shadow(0 2px 10px rgba(255, 255, 255, 0.8))'
            }} />
          </div>
        </div>

        <div
          style={{
            maxWidth: '1600px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Two Column Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Left Section - Applications */}
            <div>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '2.25rem',
                  fontWeight: '700',
                  color: '#064e3b',
                  marginBottom: '1.75rem',
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
                }}
              >
                Başvurularım
              </h2>

              {/* Stats Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <StatCard
                  icon={<ArticleOutlined style={{ fontSize: 32 }} />}
                  title="Toplam Başvuru"
                  value={totalApplications}
                  subtitle="+2 bu ay"
                  trend="up"
                />
                <StatCard
                  icon={<PendingActionsOutlined style={{ fontSize: 32 }} />}
                  title="Devam Eden"
                  value={inProgressApplications}
                  subtitle={`${Math.round((inProgressApplications / totalApplications) * 100)}%`}
                />
                <StatCard
                  icon={<CheckCircleOutlined style={{ fontSize: 32 }} />}
                  title="Tamamlanan"
                  value={completedApplications}
                  subtitle={`${Math.round((completedApplications / totalApplications) * 100)}% başarı`}
                  trend="up"
                />
              </div>

              {/* Applications List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onClick={() => console.log('Navigate to application:', app.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right Section - Documents */}
            <div>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '2.25rem',
                  fontWeight: '700',
                  color: '#064e3b',
                  marginBottom: '1.75rem',
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
                }}
              >
                Dökümanlarım
              </h2>

              {/* Quick Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <StatCard
                  icon={<FolderOpenOutlined style={{ fontSize: 32 }} />}
                  title="Toplam Belge"
                  value={totalDocuments}
                  subtitle="8 kategoride"
                />
                <StatCard
                  icon={<WarningAmberOutlined style={{ fontSize: 32 }} />}
                  title="Yakında Dolacak"
                  value={expiringSoonDocuments}
                  subtitle="30 gün içinde"
                  trend={expiringSoonDocuments > 0 ? 'up' : null}
                />
              </div>

              {/* Documents List */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  maxHeight: '700px',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {documents.map((doc) => (
                    <DocumentItem key={doc.id} document={doc} />
                  ))}
                </div>
              </div>

              {/* Floating Action Button */}
              <button
                style={{
                  position: 'fixed',
                  bottom: '2rem',
                  right: '2rem',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s ease',
                  zIndex: 1000,
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1) rotate(90deg)';
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) rotate(0deg)';
                  e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onClick={() => console.log('Upload new document')}
              >
                <AddOutlined style={{ fontSize: 28 }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1280px) {
          div[style*="gridTemplateColumns: repeat(auto-fit, minmax(600px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="gridTemplateColumns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }

        /* Custom scrollbar */
        div[style*="overflowY: auto"]::-webkit-scrollbar {
          width: 8px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 50px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 50px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </PageTransition>
  );
};

export default Dashboard;
