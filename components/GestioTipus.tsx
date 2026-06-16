'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { S, colors } from '@/lib/theme'
import type { TipusAmpolla, TipusTap, TipusSucre } from '@/lib/types'

type TipusItem = {
  id: number
  codi: string
  nom: string
  ordre: number
  actiu: boolean
  mida_cl?: number
  quantitat_g?: number | null
}

function ItemRow({ item, taula, extra, onUpdate }: {
  item: TipusItem
  taula: string
  extra?: string
  onUpdate: (item: TipusItem) => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(item)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await supabase.from(taula).update({
      codi: form.codi,
      nom: form.nom,
      ordre: form.ordre,
      actiu: form.actiu,
      ...(form.mida_cl !== undefined ? { mida_cl: form.mida_cl } : {}),
      ...(form.quantitat_g !== undefined ? { quantitat_g: form.quantitat_g } : {}),
    }).eq('id', item.id)
    onUpdate(form)
    setSaving(false)
    setEditing(false)
  }

  if (!editing) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '10px', color: colors.text3, width: '28px' }}>{item.codi}</span>
        <span style={{ fontSize: '12px', color: colors.text }}>{item.nom}</span>
        {extra && <span style={{ fontSize: '10px', color: colors.text2 }}>{extra}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          fontSize: '9px', padding: '2px 8px', borderRadius: '10px',
          background: item.actiu ? colors.tealBg : colors.bg3,
          color: item.actiu ? colors.teal : colors.text3,
          cursor: 'pointer',
        }} onClick={async () => {
          await supabase.from(taula).update({ actiu: !item.actiu }).eq('id', item.id)
          onUpdate({ ...item, actiu: !item.actiu })
        }}>
          {item.actiu ? 'actiu' : 'inactiu'}
        </span>
        <button
          onClick={() => setEditing(true)}
          style={{ fontSize: '10px', color: colors.text3, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}
        >
          editar
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '10px 16px', background: colors.amberBg }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <input
          style={{ ...S.fieldInput, width: '50px', flex: 'none' }}
          value={form.codi}
          placeholder="Codi"
          onChange={e => setForm(f => ({ ...f, codi: e.target.value }))}
        />
        <input
          style={{ ...S.fieldInput, flex: 2 }}
          value={form.nom}
          placeholder="Nom"
          onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
        />
        {form.mida_cl !== undefined && (
          <input
            style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
            type="number"
            value={form.mida_cl ?? ''}
            placeholder="cl"
            onChange={e => setForm(f => ({ ...f, mida_cl: parseInt(e.target.value) || 0 }))}
          />
        )}
        {form.quantitat_g !== undefined && (
          <input
            style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
            type="number"
            value={form.quantitat_g ?? ''}
            placeholder="g"
            onChange={e => setForm(f => ({ ...f, quantitat_g: parseFloat(e.target.value) || null }))}
          />
        )}
        <input
          style={{ ...S.fieldInput, width: '40px', flex: 'none' }}
          type="number"
          value={form.ordre}
          placeholder="Ordre"
          onChange={e => setForm(f => ({ ...f, ordre: parseInt(e.target.value) || 0 }))}
        />
      </div>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        <button style={S.btnCancel} onClick={() => { setForm(item); setEditing(false) }}>Cancel·lar</button>
        <button style={S.btnSave} onClick={save} disabled={saving}>{saving ? 'Desant...' : 'Desar'}</button>
      </div>
    </div>
  )
}

function SeccioPer<T extends TipusItem>({ title, items: initialItems, taula, extraFn, nouItem }: {
  title: string
  items: T[]
  taula: string
  extraFn?: (item: T) => string
  nouItem: Omit<T, 'id'>
}) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [afegint, setAfegint] = useState(false)
  const [nouForm, setNouForm] = useState<Omit<T, 'id'>>(nouItem)
  const [saving, setSaving] = useState(false)

  async function afegir() {
    setSaving(true)
    const { data } = await supabase.from(taula).insert(nouForm).select().single()
    if (data) setItems(i => [...i, data as T])
    setAfegint(false)
    setNouForm(nouItem)
    setSaving(false)
  }

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'DM Mono, monospace' }}>
          {title}
        </p>
        <button
          onClick={() => setAfegint(a => !a)}
          style={{ fontSize: '10px', color: colors.amber, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}
        >
          {afegint ? 'Cancel·lar' : '+ Afegir'}
        </button>
      </div>

      <div style={{ background: colors.bg2, border: `0.5px solid ${colors.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        {items.length === 0 && !afegint && (
          <div style={{ padding: '16px', fontSize: '11px', color: colors.text3, textAlign: 'center' }}>Cap element</div>
        )}
        {items.map((item, idx) => (
          <div key={item.id} style={{ borderBottom: idx < items.length - 1 || afegint ? `0.5px solid ${colors.bg3}` : 'none' }}>
            <ItemRow
              item={item}
              taula={taula}
              extra={extraFn ? extraFn(item) : undefined}
              onUpdate={updated => setItems(i => i.map(x => x.id === updated.id ? updated as T : x))}
            />
          </div>
        ))}

        {afegint && (
          <div style={{ padding: '10px 16px', background: colors.amberBg }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <input
                style={{ ...S.fieldInput, width: '50px', flex: 'none' }}
                placeholder="Codi"
                onChange={e => setNouForm(f => ({ ...f, codi: e.target.value }))}
              />
              <input
                style={{ ...S.fieldInput, flex: 2 }}
                placeholder="Nom"
                onChange={e => setNouForm(f => ({ ...f, nom: e.target.value }))}
              />
              {'mida_cl' in nouItem && (
                <input
                  style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
                  type="number" placeholder="cl"
                  onChange={e => setNouForm(f => ({ ...f, mida_cl: parseInt(e.target.value) || 0 }))}
                />
              )}
              {'quantitat_g' in nouItem && (
                <input
                  style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
                  type="number" placeholder="g"
                  onChange={e => setNouForm(f => ({ ...f, quantitat_g: parseFloat(e.target.value) || null }))}
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              <button style={S.btnCancel} onClick={() => setAfegint(false)}>Cancel·lar</button>
              <button style={S.btnSave} onClick={afegir} disabled={saving}>{saving ? 'Desant...' : 'Afegir'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GestioTipus({ ampolles, taps, sucres }: {
  ampolles: TipusAmpolla[]
  taps: TipusTap[]
  sucres: TipusSucre[]
}) {
  return (
    <div>
      <SeccioPer
        title="Ampolles"
        items={ampolles}
        taula="tipus_ampolla"
        extraFn={a => `${a.mida_cl}cl`}
        nouItem={{ codi: '', nom: '', ordre: ampolles.length + 1, actiu: true, mida_cl: 75 } as Omit<TipusAmpolla, 'id'>}
      />
      <SeccioPer
        title="Taps"
        items={taps}
        taula="tipus_tap"
        nouItem={{ codi: '', nom: '', ordre: taps.length + 1, actiu: true } as Omit<TipusTap, 'id'>}
      />
      <SeccioPer
        title="Sucre"
        items={sucres}
        taula="tipus_sucre"
        extraFn={s => s.quantitat_g ? `${s.quantitat_g}g` : '—'}
        nouItem={{ codi: '', nom: '', ordre: sucres.length + 1, actiu: true, quantitat_g: null } as Omit<TipusSucre, 'id'>}
      />
    </div>
  )
}
