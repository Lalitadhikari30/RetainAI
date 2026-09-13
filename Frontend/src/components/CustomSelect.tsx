import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface CustomSelectProps<T = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  searchable?: boolean;
  minWidth?: number | string;
}

export function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  icon,
  ariaLabel,
  size = 'md',
  searchable,
  minWidth,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-enable search if there are more than 8 options and searchable is not explicitly false
  const shouldShowSearch = searchable ?? options.length > 8;

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }

    const calculatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Estimated menu height based on number of options (capped)
      const estimatedMenuHeight = Math.min(
        options.length * 36 + (shouldShowSearch ? 46 : 12),
        270
      );
      const spaceBelow = viewportHeight - rect.bottom;
      const openUp = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

      const top = openUp ? undefined : rect.bottom + 6;
      const bottom = openUp ? viewportHeight - rect.top + 6 : undefined;

      let left = rect.left;
      const computedMinWidth =
        typeof minWidth === 'number'
          ? minWidth
          : typeof minWidth === 'string'
          ? parseInt(minWidth, 10) || 160
          : 160;

      const targetWidth = Math.max(rect.width, computedMinWidth);

      // Ensure menu doesn't overflow right edge of window
      if (left + targetWidth > viewportWidth - 12) {
        left = Math.max(12, viewportWidth - targetWidth - 12);
      }

      setMenuStyle({
        position: 'fixed',
        top: top !== undefined ? `${top}px` : undefined,
        bottom: bottom !== undefined ? `${bottom}px` : undefined,
        left: `${left}px`,
        width: rect.width > targetWidth ? `${rect.width}px` : `${targetWidth}px`,
        zIndex: 99999,
      });
    };

    calculatePosition();

    const handleScroll = (e: Event) => {
      // Don't close or break if scroll occurs inside the select menu itself
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      calculatePosition();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    if (shouldShowSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, options.length, minWidth, shouldShowSearch]);

  const filteredOptions = searchQuery.trim()
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={`group flex items-center justify-between text-left font-medium transition-all duration-150 outline-none cursor-pointer ${
          isSmall
            ? 'px-2.5 py-1 text-xs rounded-lg gap-1.5'
            : 'px-3 py-2 text-xs rounded-xl gap-2'
        } ${
          isOpen
            ? 'bg-surface-container-low border-primary ring-2 ring-primary/20 shadow-xs'
            : 'bg-surface-container-low/70 hover:bg-surface-container-low border-outline-variant/30 hover:border-primary/40'
        } border text-on-surface ${
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {icon && <span className="shrink-0 text-on-surface-variant">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-on-surface-variant group-hover:text-on-surface shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            role="listbox"
            aria-label={ariaLabel}
            className={`bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${menuClassName}`}
          >
            {shouldShowSearch && (
              <div className="p-2 border-b border-outline-variant/20 bg-surface-container-low/30">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs">
                  <Search className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full bg-transparent outline-none text-xs text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>
            )}

            <div className="p-1.5 max-h-60 overflow-y-auto flex flex-col gap-0.5 select-none">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-on-surface-variant">
                  No matching options
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        triggerRef.current?.focus();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                          : 'text-on-surface hover:bg-surface-container-high/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {opt.icon && (
                          <span className="shrink-0 text-on-surface-variant">{opt.icon}</span>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{opt.label}</span>
                          {opt.description && (
                            <span className="text-[10px] text-on-surface-variant/70 font-normal truncate">
                              {opt.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 stroke-[2.5]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
