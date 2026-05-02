'use client'

import { colors, S } from '@/lib/theme'
import { ReactNode } from 'react'

// ============================================================
// CARD — component global per a totes les fitxes de producció
// ============================================================

// Camp en mode lectura
export function FieldRead({ label, value, auto }: {
  label: string
  value?: string | number | null
  auto?: boolean
}) {
  return (
    <div style={S.fieldRow}>
      <span style={S.fieldLabel}>{label}</span>
      <span style={value != null ? S.fieldValue : S.fieldEmpty}>
        {value ?? '—'}
        {auto && value != null && (
          <span style={{ fontSize: '9px', color: colors.text3, marginLeft: '6px' }}>automàtic</span>
        )}
      </span>
    </div>
  )
}

// Camp en mode edició — input
export function FieldInput({ label, value, type = 'text', step, onChange }: {
  label: string
  value?: string | number | null
  type?: string
  step?: string
  onChange: (val: string | number | null) => void
}) {
  return (
    <div style={S.fieldRow}>
      <span style={S.fieldLabel}>{label}</span>
      <input
        style={S.fieldInput}
        type={type}
        step={step}
        value={value ?? ''}
        onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) || null : e.target.value || null)}
      />
    </div>
  )
}

// Camp en mode edició — select
export function FieldSelect({ label, value, options, onChange }: {
  label: string
  value?: string | number | null
  options: { value: string | number; label: string }[]
  onChange: (val: string | number) => void
}) {
  return (
    <div style={S.fieldRow}>
      <span style={S.fieldLabel}>{label}</span>
      <select
        style={S.fieldSelect}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">—</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// Camp automàtic (no editable)
export function FieldAuto({ label, value }: {
  label: string
  value?: string | number | null
}) {
  return (
    <div style={S.fieldRow}>
      <span style={S.fieldLabel}>{label}</span>
      <span style={S.autoField}>
        {value != null ? `${value} — automàtic` : 'calculat automàticament'}
      </span>
    </div>
  )
}

// Balanç
export function Balance({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div style={ok ? S.balOk : S.balWarn}>{text}</div>
  )
}

// Capçal de la card
export function CardHead({ id, saved, teal }: {
  id: string
  saved?: boolean
  teal?: boolean
}) {
  return (
    <div style={S.cardHead}>
      <span style={{
        ...S.cardId,
        ...(teal ? { background: colors.tealBg, color: colors.teal } : {}),
      }}>
        {id}
      </span>
      {saved !== undefined && (
        <span style={saved ? S.badgeSaved : S.badgeEdit}>
          {saved ? 'desat' : 'editant'}
        </span>
      )}
    </div>
  )
}

// Peu de la card — mode lectura
export function CardFootRead({ onEdit, onDelete }: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div style={S.cardFoot}>
      <button
        style={S.btnDel}
        onClick={onDelete}
        onMouseOver={e => (e.currentTarget.style.color = colors.danger)}
        onMouseOut={e => (e.currentTarget.style.color = colors.text3)}
      >
        eliminar
      </button>
      <button style={S.btnEdit} onClick={onEdit}>Editar</button>
    </div>
  )
}

// Peu de la card — mode edició
export function CardFootEdit({ onSave, onCancel, onDelete, saving }: {
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
  saving?: boolean
}) {
  return (
    <div style={S.cardFoot}>
      <button
        style={S.btnDel}
        onClick={onDelete}
        onMouseOver={e => (e.currentTarget.style.color = colors.danger)}
        onMouseOut={e => (e.currentTarget.style.color = colors.text3)}
      >
        eliminar
      </button>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button style={S.btnCancel} onClick={onCancel}>Cancel·lar</button>
        <button style={S.btnSave} onClick={onSave} disabled={saving}>
          {saving ? 'Desant...' : 'Desar'}
        </button>
      </div>
    </div>
  )
}

// Card compacta (mode lateral)
export function CardCompact({ id, badge, badgeColor, accentLeft, fields }: {
  id: string
  badge?: string
  badgeColor?: 'teal' | 'amber'
  accentLeft?: 'teal' | 'amber'
  fields: { label: string; value?: string | number | null }[]
}) {
  return (
    <div style={{
      ...S.card,
      borderLeft: accentLeft
        ? `2px solid ${accentLeft === 'teal' ? colors.teal : colors.amber}`
        : undefined,
    }}>
      <div style={S.cardHead}>
        <span style={{
          ...S.cardId,
          ...(badgeColor === 'teal' ? { background: colors.tealBg, color: colors.teal } : {}),
          ...(badgeColor === 'amber' ? { background: colors.amberBg, color: colors.amberHi } : {}),
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%',
        }}>
          {id}
        </span>
        {badge && (
          <span style={{ fontSize: '10px', color: badgeColor === 'teal' ? colors.teal : colors.text3, flexShrink: 0 }}>
            {badge}
          </span>
        )}
      </div>
      {fields.map(f => (
        <div key={f.label} style={{
          display: 'flex', alignItems: 'center',
          padding: '4px 8px',
          borderBottom: `0.5px solid ${colors.bg3}`,
          overflow: 'hidden',
        }}>
          <span style={{
            fontSize: '8px', textTransform: 'uppercase' as const,
            letterSpacing: '0.06em', color: colors.text3,
            width: '40px', flexShrink: 0,
          }}>
            {f.label}
          </span>
          <span style={{
            fontSize: '11px',
            color: f.value != null ? colors.text : colors.border2,
            fontWeight: f.value != null ? '500' : '400',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', flex: 1, minWidth: 0,
          }}>
            {f.value ?? '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

// Secció d'origens amb llista editable
export function OrigensEditor<T extends { id: number }>({
  origens,
  opcions,
  unit,
  labelKey,
  onAdd,
  onUpdate,
  onRemove,
}: {
  origens: { ref_id: number; quantitat: number }[]
  opcions: T[]
  unit: string
  labelKey: keyof T
  onAdd: () => void
  onUpdate: (idx: number, field: string, value: unknown) => void
  onRemove: (idx: number) => void
}) {
  return (
    <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
      <div style={S.sectionHead}>Origen</div>
      {origens.map((o, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
          <select
            style={{ ...S.fieldSelect, flex: 2 }}
            value={o.ref_id}
            onChange={e => onUpdate(i, 'ref_id', parseInt(e.target.value))}
          >
            {opcions.map(op => (
              <option key={op.id} value={op.id}>{String(op[labelKey])}</option>
            ))}
          </select>
          <input
            style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
            type="number"
            value={o.quantitat || ''}
            placeholder={unit}
            onChange={e => onUpdate(i, 'quantitat', parseFloat(e.target.value) || 0)}
          />
          <span style={{ fontSize: '10px', color: colors.text3 }}>{unit}</span>
          <button
            onClick={() => onRemove(i)}
            style={{ ...S.btnDel, fontSize: '12px' }}
          >✕</button>
        </div>
      ))}
      <button onClick={onAdd} style={S.btnAdd}>+ Afegir origen</button>
    </div>
  )
}

// Wrapper principal de la card
export default function Card({ children, editing, accentLeft }: {
  children: ReactNode
  editing?: boolean
  accentLeft?: 'teal' | 'amber'
}) {
  return (
    <div style={{
      ...(editing ? S.cardEditing : S.card),
      borderLeft: accentLeft
        ? `2px solid ${accentLeft === 'teal' ? colors.teal : colors.amber}`
        : undefined,
    }}>
      {children}
    </div>
  )
}
