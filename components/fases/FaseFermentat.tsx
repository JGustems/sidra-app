'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Fermentador, FermentadorOrigen, Ebullidor, SucDirecte } from '@/lib/types'

type FermentadorAmbOrigen = Fermentador & { fermentador_origen: FermentadorOrigen[] }

interface Props {
  data: {
    jornada: { id: number }
    ebullidors: Ebullidor[]
    sucsDirectes: SucDirecte[]
    fermentadors: FermentadorAmbOrigen[]
  }
  compact?: boolean
}

const S = {
  card:        { background: '#1a1917', border: '0.5px solid #252422', borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardEditing: { background: '#1a1917', border: '0.5px solid #BA7517', borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardHead:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderBottom: '0.5px solid #252422', background: '#141412' },
  cardId:      { fontSize: '11px', fontWeight: '500' as const, color: '#c8c4be', background: '#252422', padding: '2px 8px', borderRadius: '4px' },
  fieldRow:    { display: 'flex' as const, alignItems: 'center' as const, padding: '7px 12px', borderBottom: '0.5px solid #1e1d1b' },
  fieldLabel:  { fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#4a4846', width: '120px', flexShrink: 0 },
  fieldValue:  { fontSize: '12px', color: '#c8c4be', fontWeight: '500' as const },
  fieldEmpty:  { fontSize: '11px', color: '#2e2c2a', fontStyle: 'italic' as const },
  fieldInput:  { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: 'transparent', border: 'none', borderBottom: '1px solid #2e2c2a', color: '#e8e4de', outline: 'none', flex: 1, padding: '1px 4px' },
  fieldSelect: { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: '#1a1917', border: 'none', borderBottom: '1px solid #2e2c2a', color: '#e8e4de', outline: 'none', flex: 1, padding: '1px 4px' },
  cardFoot:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderTop: '0.5px solid #252422', background: '#141412' },
  badgeSaved:  { fontSize: '9px', background: '#0a2318', color: '#1D9E75', padding: '2px 8px', borderRadius: '10px' },
  badgeEdit:   { fontSize: '9px', background: '#2a1800', color: '#EF9F27', padding: '2px 8px', borderRadius: '10px' },
  btnEdit:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: '0.5px solid #2e2c2a', background: 'none', color: '#7a7672', cursor: 'pointer' },
  btnSave:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 14px', borderRadius: '5px', border: 'none', background: '#BA7517', color: '#fff', cursor: 'pointer' },
  btnCancel:   { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: '0.5px solid #252422', background: 'none', color: '#5a5854', cursor: 'pointer' },
  btnDel:      { fontFamily: 'DM Mono, monospace', fontSize: '10px', border: 'none', background: 'none', color: '#3a3835', cursor: 'pointer' },
  balOk:       { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: '#0a2318', color: '#1D9E75', margin: '0 12px 8px' },
  balWarn:     { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: '#2a1800', color: '#EF9F27', margin: '0 12px 8px' },
  autoField:   { fontSize: '11px', color: '#4a4846', fontStyle: 'italic' as const },
  lotBadge:    { fontSize: '10px', background: '#2a1800', color: '#EF9F27', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' as const },
}

function FermentadorCard({ fermentador, ebullidors, sucsDirectes, onDelete, onSave, compact }: {
  fermentador: Partial<FermentadorAmbOrigen> & { _local?: boolean }
  ebullidors: Ebullidor[]
  sucsDirectes: SucDirecte[]
  onDelete: () => void
  onSave: (f: Partial<FermentadorAmbOrigen>) => void
  compact?: boolean
}) {
  const [editing, setEditing] = useState(!fermentador.id)
  const [form, setForm] = useState(fermentador)
  const [origens, setOrigens] = useState<{ tipus: 'ebullidor' | 'suc'; id: number; vol_l: number }[]>(
    fermentador.fermentador_origen?.map(o => ({
      tipus: o.ebullidor_id ? 'ebullidor' : 'suc',
      id: o.ebullidor_id ?? o.suc_directe_id ?? 0,
      vol_l: o.vol_l,
    })) ?? []
  )
  const [saving, setSaving] = useState(false)

  const volTotal = origens.reduce((s, o) => s + (o.vol_l || 0), 0)
  const grauAlcoholic = form.sg_inicial && form.sg_final
    ? ((form.sg_inicial - form.sg_final) * 131.25).toFixed(1)
    : null

  function addOrigen() {
    const defaultId = ebullidors[0]?.id ?? sucsDirectes[0]?.id ?? 0
    const defaultTipus = ebullidors.length > 0 ? 'ebullidor' : 'suc'
    setOrigens(o => [...o, { tipus: defaultTipus, id: defaultId, vol_l: 0 }])
  }

  function updateOrigen(idx: number, field: string, value: unknown) {
    setOrigens(o => o.map((item, i) => {
      if (i !== idx) return item
      if (field === 'tipus') {
        const newId = value === 'ebullidor' ? ebullidors[0]?.id : sucsDirectes[0]?.id
        return { ...item, tipus: value as 'ebullidor' | 'suc', id: newId ?? 0 }
      }
      return { ...item, [field]: value }
    }))
  }

  async function save() {
    setSaving(true)
    const fermentadorOrigens = origens.map(o => ({
      fermentador_id: fermentador.id ?? 0,
      ebullidor_id: o.tipus === 'ebullidor' ? o.id : null,
      suc_directe_id: o.tipus === 'suc' ? o.id : null,
      vol_l: o.vol_l,
      id: 0,
    }))
    await onSave({ ...form, vol_l: volTotal, fermentador_origen: fermentadorOrigens })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
  <div style={S.card}>
    <div style={S.cardHead}>
      <span style={S.cardId}>{form.codi}</span>
      {form.lot && <span style={S.lotBadge}>LOT {form.lot}</span>}
    </div>
    {[
      { label: 'Vol',    value: volTotal > 0 ? `${volTotal} l` : null },
      { label: 'SG ini', value: form.sg_inicial ? `${form.sg_inicial}` : null },
      { label: 'SG fin', value: form.sg_final ? `${form.sg_final}` : null },
    ].map(f => (
      <div key={f.label} style={{ ...S.fieldRow, gap: '4px', overflow: 'hidden' }}>
        <span style={{ ...S.fieldLabel, width: '60px', flexShrink: 0 }}>{f.label}</span>
        <span style={{ ...(f.value != null ? S.fieldValue : S.fieldEmpty), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {f.value ?? '—'}
        </span>
      </div>
    ))}
  </div>
)

  if (!editing) return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={S.cardId}>{form.codi}</span>
          {form.lot && <span style={S.lotBadge}>LOT {form.lot}</span>}
        </div>
        <span style={S.badgeSaved}>desat</span>
      </div>
      {[
        { label: 'LOT',          value: form.lot },
        { label: 'Slot',         value: form.slot },
        { label: 'Perol',        value: form.perol },
        { label: 'Vol total (l)', value: volTotal > 0 ? `${volTotal} l` : null, auto: true },
        { label: 'SG inicial',   value: form.sg_inicial },
        { label: 'SG final',     value: form.sg_final },
        { label: 'Grau alc. %',  value: grauAlcoholic ? `${grauAlcoholic}%` : null, auto: true },
        { label: 'T control',    value: form.temp_sp_c ? `${form.temp_sp_c}°C` : null },
        { label: 'T mitjana',    value: form.temp_avg_c ? `${form.temp_avg_c}°C` : null },
        { label: 'Durada (dies)', value: form.durada_dies },
      ].map(f => (
        <div key={f.label} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <span style={f.value != null ? S.fieldValue : S.fieldEmpty}>
            {f.value ?? '—'}
            {(f as {auto?: boolean}).auto && f.value != null && <span style={{ fontSize: '9px', color: '#4a4846', marginLeft: '6px' }}>automàtic</span>}
          </span>
        </div>
      ))}
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Llevat afegit</span>
        <span style={S.fieldValue}>{form.llevat_afegit ? `Sí — ${form.llevat_tipus ?? ''} ${form.llevat_pes_g ? `(${form.llevat_pes_g}g)` : ''}` : 'No'}</span>
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Dins caixa</span>
        <span style={S.fieldValue}>{form.dins_caixa ? 'Sí' : 'No'}</span>
      </div>
      <div style={{ padding: '7px 12px', borderBottom: '0.5px solid #1e1d1b' }}>
        <div style={{ fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#4a4846', marginBottom: '6px' }}>
          Origen
        </div>
        {origens.length === 0 && <span style={S.fieldEmpty}>—</span>}
        {origens.map((o, i) => {
          const nom = o.tipus === 'ebullidor'
            ? ebullidors.find(e => e.id === o.id)?.codi
            : sucsDirectes.find(s => s.id === o.id)?.codi
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: '#7a7672' }}>{nom} {o.tipus === 'suc' ? '(directe)' : ''}</span>
              <span style={{ color: '#c8c4be', fontWeight: '500' }}>{o.vol_l} l</span>
            </div>
          )
        })}
      </div>
      {form.notes && (
        <div style={{ padding: '7px 12px', borderBottom: '0.5px solid #1e1d1b' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#4a4846', marginBottom: '4px' }}>Notes</div>
          <div style={{ fontSize: '11px', color: '#7a7672' }}>{form.notes}</div>
        </div>
      )}
      <div style={S.cardFoot}>
        <button style={S.btnDel} onClick={onDelete} onMouseOver={e => (e.currentTarget.style.color='#E24B4A')} onMouseOut={e => (e.currentTarget.style.color='#3a3835')}>eliminar</button>
        <button style={S.btnEdit} onClick={() => setEditing(true)}>Editar</button>
      </div>
    </div>
  )

  return (
    <div style={S.cardEditing}>
      <div style={S.cardHead}>
        <span style={S.cardId}>{form.codi}</span>
        <span style={S.badgeEdit}>editant</span>
      </div>
      {[
        { label: 'LOT',          field: 'lot',         type: 'text'   },
        { label: 'Slot',         field: 'slot',        type: 'text'   },
        { label: 'Perol',        field: 'perol',       type: 'text'   },
        { label: 'SG inicial',   field: 'sg_inicial',  type: 'number' },
        { label: 'SG final',     field: 'sg_final',    type: 'number' },
        { label: 'T control (°C)', field: 'temp_sp_c', type: 'number' },
        { label: 'T mitjana (°C)', field: 'temp_avg_c',type: 'number' },
        { label: 'Durada (dies)', field: 'durada_dies',type: 'number' },
        { label: 'Data inici',   field: 'data_inici',  type: 'date'   },
      ].map(f => (
        <div key={f.field} style={S.fieldRow}>
          <span style={S.fieldLabel}>{f.label}</span>
          <input
            style={S.fieldInput}
            type={f.type}
            step={f.type === 'number' ? '0.001' : undefined}
            value={(form as Record<string, unknown>)[f.field] as string ?? ''}
            onChange={e => setForm(fm => ({ ...fm, [f.field]: f.type === 'number' ? parseFloat(e.target.value) || null : e.target.value }))}
          />
        </div>
      ))}
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Vol total (l)</span>
        <span style={S.autoField}>{volTotal > 0 ? `${volTotal} l — suma origens` : 'calculat automàticament'}</span>
      </div>
      {grauAlcoholic && (
        <div style={S.fieldRow}>
          <span style={S.fieldLabel}>Grau alc. %</span>
          <span style={S.autoField}>{grauAlcoholic}% — calculat</span>
        </div>
      )}
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Llevat afegit</span>
        <input
          type="checkbox"
          checked={form.llevat_afegit ?? false}
          onChange={e => setForm(fm => ({ ...fm, llevat_afegit: e.target.checked }))}
          style={{ marginRight: '8px' }}
        />
        {form.llevat_afegit && (
          <>
            <input
              style={{ ...S.fieldInput, flex: 2 }}
              type="text"
              placeholder="Tipus llevat"
              value={form.llevat_tipus ?? ''}
              onChange={e => setForm(fm => ({ ...fm, llevat_tipus: e.target.value }))}
            />
            <input
              style={{ ...S.fieldInput, width: '50px', flex: 'none', marginLeft: '8px' }}
              type="number"
              placeholder="g"
              value={form.llevat_pes_g ?? ''}
              onChange={e => setForm(fm => ({ ...fm, llevat_pes_g: parseFloat(e.target.value) || null }))}
            />
            <span style={{ fontSize: '10px', color: '#4a4846', marginLeft: '4px' }}>g</span>
          </>
        )}
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Dins caixa</span>
        <input
          type="checkbox"
          checked={form.dins_caixa ?? true}
          onChange={e => setForm(fm => ({ ...fm, dins_caixa: e.target.checked }))}
        />
      </div>
      <div style={{ padding: '8px 12px', borderBottom: '0.5px solid #1e1d1b' }}>
        <div style={{ fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#4a4846', marginBottom: '8px' }}>
          Origen (ebullidors / suc directe)
        </div>
        {origens.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
            <select
              style={{ ...S.fieldSelect, width: '90px', flex: 'none' }}
              value={o.tipus}
              onChange={e => updateOrigen(i, 'tipus', e.target.value)}
            >
              {ebullidors.length > 0 && <option value="ebullidor">Ebullidor</option>}
              {sucsDirectes.length > 0 && <option value="suc">Suc directe</option>}
            </select>
            <select
              style={{ ...S.fieldSelect, flex: 2 }}
              value={o.id}
              onChange={e => updateOrigen(i, 'id', parseInt(e.target.value))}
            >
              {o.tipus === 'ebullidor'
                ? ebullidors.map(e => <option key={e.id} value={e.id}>{e.codi}</option>)
                : sucsDirectes.map(s => <option key={s.id} value={s.id}>{s.codi}</option>)
              }
            </select>
            <input
              style={{ ...S.fieldInput, width: '55px', flex: 'none' }}
              type="number"
              value={o.vol_l || ''}
              placeholder="l"
              onChange={e => updateOrigen(i, 'vol_l', parseFloat(e.target.value) || 0)}
            />
            <span style={{ fontSize: '10px', color: '#4a4846' }}>l</span>
            <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))} style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
          </div>
        ))}
        <button onClick={addOrigen} style={{ fontSize: '10px', color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
          + Afegir origen
        </button>
      </div>
      <div style={{ ...S.fieldRow, borderBottom: 'none' }}>
        <span style={S.fieldLabel}>Notes</span>
        <input
          style={S.fieldInput}
          type="text"
          value={form.notes ?? ''}
          onChange={e => setForm(fm => ({ ...fm, notes: e.target.value || null }))}
        />
      </div>
      <div style={S.cardFoot}>
        <button style={S.btnDel} onClick={onDelete}>eliminar</button>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button style={S.btnCancel} onClick={() => setEditing(false)}>Cancel·lar</button>
          <button style={S.btnSave} onClick={save} disabled={saving}>{saving ? 'Desant...' : 'Desar'}</button>
        </div>
      </div>
    </div>
  )
}

export default function FaseFermentat({ data, compact }: Props) {
  const router = useRouter()
  const [fermentadors, setFermentadors] = useState<(Partial<FermentadorAmbOrigen> & { _local?: boolean })[]>(data.fermentadors)

  function addFermentador() {
    const num = fermentadors.length + 1
    setFermentadors(f => [...f, {
      codi: `F${num}`, jornada_id: data.jornada.id,
      llevat_afegit: false, dins_caixa: true,
      fermentador_origen: [], _local: true,
    }])
  }

  async function saveFermentador(idx: number, form: Partial<FermentadorAmbOrigen>) {
    const f = fermentadors[idx]
    const origens = form.fermentador_origen ?? []

    if (f.id) {
      await supabase.from('fermentador').update({
        lot: form.lot, slot: form.slot, perol: form.perol, vol_l: form.vol_l,
        llevat_afegit: form.llevat_afegit, llevat_tipus: form.llevat_tipus, llevat_pes_g: form.llevat_pes_g,
        dins_caixa: form.dins_caixa, temp_sp_c: form.temp_sp_c, temp_avg_c: form.temp_avg_c,
        sg_inicial: form.sg_inicial, sg_final: form.sg_final,
        data_inici: form.data_inici, durada_dies: form.durada_dies, notes: form.notes,
      }).eq('id', f.id)
      await supabase.from('fermentador_origen').delete().eq('fermentador_id', f.id)
      if (origens.length > 0) {
        await supabase.from('fermentador_origen').insert(origens.map(o => ({
          fermentador_id: f.id!,
          ebullidor_id: o.ebullidor_id,
          suc_directe_id: o.suc_directe_id,
          vol_l: o.vol_l,
        })))
      }
    } else {
      const { data: nou } = await supabase.from('fermentador').insert({
        jornada_id: data.jornada.id, codi: form.codi!, lot: form.lot ?? '',
        slot: form.slot, perol: form.perol, vol_l: form.vol_l,
        llevat_afegit: form.llevat_afegit ?? false, llevat_tipus: form.llevat_tipus, llevat_pes_g: form.llevat_pes_g,
        dins_caixa: form.dins_caixa ?? true, temp_sp_c: form.temp_sp_c, temp_avg_c: form.temp_avg_c,
        sg_inicial: form.sg_inicial, sg_final: form.sg_final,
        data_inici: form.data_inici, durada_dies: form.durada_dies, notes: form.notes,
      }).select().single()
      if (nou && origens.length > 0) {
        await supabase.from('fermentador_origen').insert(origens.map(o => ({
          fermentador_id: nou.id,
          ebullidor_id: o.ebullidor_id,
          suc_directe_id: o.suc_directe_id,
          vol_l: o.vol_l,
        })))
      }
      if (nou) setFermentadors(fe => fe.map((item, i) => i === idx ? { ...nou, fermentador_origen: [], _local: false } : item))
    }
    router.refresh()
  }

  async function deleteFermentador(idx: number) {
    const f = fermentadors[idx]
    if (f.id) { await supabase.from('fermentador').delete().eq('id', f.id); router.refresh() }
    setFermentadors(fe => fe.filter((_, i) => i !== idx))
  }

  if (compact) return (
    <div>
      {fermentadors.length === 0 && <div style={{ fontSize: '10px', color: '#3a3835', padding: '8px 12px' }}>Cap fermentador</div>}
      {fermentadors.map((f, idx) => (
        <FermentadorCard key={f.id ?? `local-${idx}`} fermentador={f} compact
          ebullidors={data.ebullidors} sucsDirectes={data.sucsDirectes}
          onDelete={() => deleteFermentador(idx)} onSave={fe => saveFermentador(idx, fe)} />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '460px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: '#4a4846', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fermentadors</span>
        <button onClick={addFermentador} style={{ fontSize: '10px', color: '#BA7517', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>+ Afegir fermentador</button>
      </div>
      {fermentadors.length === 0 && (
        <div style={{ border: '0.5px dashed #252422', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#3a3835', fontSize: '12px' }}>
          Cap fermentador afegit
        </div>
      )}
      {fermentadors.map((f, idx) => (
        <FermentadorCard key={f.id ?? `local-${idx}`} fermentador={f}
          ebullidors={data.ebullidors} sucsDirectes={data.sucsDirectes}
          onDelete={() => deleteFermentador(idx)} onSave={fe => saveFermentador(idx, fe)} />
      ))}
    </div>
  )
}
