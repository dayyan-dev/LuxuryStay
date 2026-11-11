const Spinner = ({ className = '', size = 'sm' }) => (
  <span
    className={`ls-loader ${className}`}
    style={{ width: size === 'lg' ? 48 : 32, height: size === 'lg' ? 48 : 32, display: 'inline-block' }}
  />
);

export const PremiumButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const variantClass = `ls-btn-${variant}`;
  const sizeClass = size === 'sm' ? 'ls-btn-sm' : size === 'lg' ? 'ls-btn-lg' : '';
  const blockClass = fullWidth ? 'ls-btn-block' : '';
  return (
    <button
      type={type}
      className={`ls-btn ${variantClass} ${sizeClass} ${blockClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="ls-loader ls-loader-inline" style={{ width: 18, height: 18, marginRight: 6 }} />
          <span>Working...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export const PremiumInput = ({
  id,
  label,
  required = false,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helper,
  select = false,
  textarea = false,
  rows = 4,
  options,
  className = '',
  ...props
}) => {
  const hasError = !!error;
  const Element = select ? 'select' : textarea ? 'textarea' : 'input';
  const inputProps = textarea
    ? { value, onChange, rows, className: `ls-input ${className} ${hasError ? 'is-invalid' : ''}`, ...props }
    : { type, value, onChange, placeholder, className: `ls-input ${className} ${hasError ? 'is-invalid' : ''}`, ...props };
  return (
    <div className="ls-input-group">
      <label htmlFor={id} className={`ls-input-label ${required ? 'ls-input-required' : ''}`}>
        {label}
      </label>
      <Element id={id} {...inputProps} />
      {hasError && <span className="ls-field-error">{error}</span>}
      {!hasError && helper && <span className="ls-field-helper">{helper}</span>}
    </div>
  );
};

export const PremiumCard = ({ children, className = '', borderless = false, header, footer, ...props }) => {
  return (
    <div className={`ls-card ${borderless ? 'ls-card-borderless' : ''} ${className}`} {...props}>
      {header && <div className="ls-card-header">{header}</div>}
      <div className="ls-card-body">{children}</div>
      {footer && <div className="ls-card-footer">{footer}</div>}
    </div>
  );
};

export const PremiumBadge = ({ children, variant = 'ghost', className = '' }) => (
  <span className={`ls-badge ls-badge-${variant} ${className}`}>{children}</span>
);

export const PremiumTable = ({ children, className = '', wrap = true }) => (
  <div className={`ls-table-wrap ${wrap ? '' : ''} ${className}`}>
    <table className="ls-table">{children}</table>
  </div>
);

export const PremiumTableHead = ({ children }) => <thead>{children}</thead>;
export const PremiumTableBody = ({ children }) => <tbody>{children}</tbody>;
export const PremiumTableRow = ({ children, className = '' }) => <tr className={className}>{children}</tr>;
export const PremiumTableCell = ({ children, as = 'td', header = false, className = '' }) => {
  const Tag = header ? 'th' : 'td';
  return <Tag className={className}>{children}</Tag>;
};

export const Skeleton = ({ type = 'text', className = '' }) => {
  const base = type === 'avatar' ? 'ls-skeleton-avatar' : type === 'card' ? 'ls-skeleton-card' : 'ls-skeleton-text';
  return <div className={`ls-skeleton ${base} ${className}`} />;
};

export const EmptyState = ({
  icon = '🛎️',
  title,
  subtitle,
  action,
  className = '',
}) => (
  <div className={`ls-empty ${className}`}>
    <div className="ls-empty-icon">{icon}</div>
    {title && <h3 className="ls-empty-title">{title}</h3>}
    {subtitle && <p className="ls-empty-sub">{subtitle}</p>}
    {action}
  </div>
);

export const Loader = ({ fullPage = false, className = '' }) => (
  <div className={`ls-loader ${fullPage ? 'ls-loader-lg' : ''} ${className}`} />
);

export const PremiumModal = ({ isOpen, onClose, children, title, maxWidth, className = '' }) => {
  if (!isOpen) return null;
  return (
    <div className="ls-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ls-modal ${className}`} style={{ maxWidth: maxWidth || '640px' }} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="ls-modal-header">
            <h4 className="ls-modal-title">{title}</h4>
            <button className="ls-modal-close" onClick={onClose} aria-label="Close dialog">×
            </button>
          </div>
        )}
        <div className="ls-modal-body">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  isOpen, onClose, onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
}) => (
  <PremiumModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="460px">
    <div className="text-center">
      <p className="text-muted" style={{ marginBottom: '1.75rem' }}>{message}</p>
      <div className="ls-btn-group ls-confirm-actions" style={{ justifyContent: 'center' }}>
        <PremiumButton variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </PremiumButton>
        <PremiumButton
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
          fullWidth
        >
          {confirmLabel}
        </PremiumButton>
      </div>
    </div>
  </PremiumModal>
);

export default PremiumButton;
