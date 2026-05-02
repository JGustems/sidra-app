'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Fermentador, FermentadorOrigen, Ebullidor, SucDirecte } from '@/lib/types'
import { S, colors } from '@/lib/theme'
import Card, { CardHead, CardFootRead, CardFootEdit, FieldRead, FieldInput, FieldAuto, Balance, CardCompact } from '@/components/ui/Card'

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
    const defaultTipus = ebullidors.length > 0 ? 'ebullidor' : 'suc'
    const defaultId = ebullidors[0]?.id ?? sucsDirectes[0]?.id ?? 0
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
      vol_l: o.vol_l, id: 0,
    }))
    await onSave({ ...form, vol_l: volTotal, fermentador_origen: fermentadorOrigens })
    setSaving(false)
    setEditing(false)
  }

  if (compact) return (
    <CardCompact
      id={form.codi ?? ''}
      badge={form.lot ? `LOT ${form.lot}` : undefined}
      badgeColor="amber"
      fields={[
        { label: 'Vol',    value: volTotal > 0 ? `${volTotal} l` : null },
        { label: 'SG ini', value: form.sg_inicial },
        { label: 'SG fin', value: form.sg_final },
      ]}
    />
  )

  if (!editing) return (
    <Card>
      <div style={S.cardHead}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={S.cardId}>{form.codi}</span>
          {form.lot && <span style={S.lotBadge}>LOT {form.lot}</span>}
        </div>
        <span style={S.badgeSaved}>desat</span>
      </div>
      <FieldRead label="LOT" value={form.lot} />
      <FieldRead label="Slot" value={form.slot} />
      <FieldRead label="Perol" value={form.perol} />
      <FieldRead label="Vol total (l)" value={volTotal > 0 ? `${volTotal} l` : null} auto />
      <FieldRead label="SG inicial" value={form.sg_inicial} />
      <FieldRead label="SG final" value={form.sg_final} />
      <FieldRead label="Grau alc. %" value={grauAlcoholic ? `${grauAlcoholic}%` : null} auto />
      <FieldRead label="T control" value={form.temp_sp_c ? `${form.temp_sp_c}°C` : null} />
      <FieldRead label="T mitjana" value={form.temp_avg_c ? `${form.temp_avg_c}°C` : null} />
      <FieldRead label="Durada (dies)" value={form.durada_dies} />
      <FieldRead label="Data inici" value={form.data_inici} />
      <FieldRead label="Llevat" value={form.llevat_afegit ? `${form.llevat_tipus ?? '—'} ${form.llevat_pes_g ? `(${form.llevat_pes_g}g)` : ''}` : 'No'} />
      <FieldRead label="Dins caixa" value={form.dins_caixa ? 'Sí' : 'No'} />
      <div style={{ padding: '7px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Origen</div>
        {origens.length === 0 && <span style={S.fieldEmpty}>—</span>}
        {origens.map((o, i) => {
          const nom = o.tipus === 'ebullidor'
            ? ebullidors.find(e => e.id === o.id)?.codi
            : sucsDirectes.find(s => s.id === o.id)?.codi
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: colors.text2 }}>{nom} {o.tipus === 'suc' ? '(directe)' : ''}</span>
              <span style={{ color: colors.text, fontWeight: '500' }}>{o.vol_l} l</span>
            </div>
          )
        })}
      </div>
      {form.notes && (
        <div style={{ padding: '7px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
          <div style={S.sectionHead}>Notes</div>
          <div style={{ fontSize: '11px', color: colors.text2 }}>{form.notes}</div>
        </div>
      )}
      <CardFootRead onEdit={() => setEditing(true)} onDelete={onDelete} />
    </Card>
  )

  return (
    <Card editing>
      <CardHead id={form.codi ?? ''} saved={false} />
      <FieldInput label="LOT" value={form.lot} onChange={v => setForm(f => ({ ...f, lot: v as string }))} />
      <FieldInput label="Slot" value={form.slot} onChange={v => setForm(f => ({ ...f, slot: v as string }))} />
      <FieldInput label="Perol" value={form.perol} onChange={v => setForm(f => ({ ...f, perol: v as string }))} />
      <FieldAuto label="Vol total (l)" value={volTotal > 0 ? `${volTotal} l` : null} />
      <FieldInput label="SG inicial" value={form.sg_inicial} type="number" step="0.001" onChange={v => setForm(f => ({ ...f, sg_inicial: v as number }))} />
      <FieldInput label="SG final" value={form.sg_final} type="number" step="0.001" onChange={v => setForm(f => ({ ...f, sg_final: v as number }))} />
      {grauAlcoholic && <FieldAuto label="Grau alc. %" value={`${grauAlcoholic}%`} />}
      <FieldInput label="T control (°C)" value={form.temp_sp_c} type="number" onChange={v => setForm(f => ({ ...f, temp_sp_c: v as number }))} />
      <FieldInput label="T mitjana (°C)" value={form.temp_avg_c} type="number" onChange={v => setForm(f => ({ ...f, temp_avg_c: v as number }))} />
      <FieldInput label="Durada (dies)" value={form.durada_dies} type="number" onChange={v => setForm(f => ({ ...f, durada_dies: v as number }))} />
      <FieldInput label="Data inici" value={form.data_inici} type="date" onChange={v => setForm(f => ({ ...f, data_inici: v as string }))} />
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Llevat afegit</span>
        <input type="checkbox" checked={form.llevat_afegit ?? false}
          onChange={e => setForm(f => ({ ...f, llevat_afegit: e.target.checked }))}
          style={{ marginRight: '8px' }} />
        {form.llevat_afegit && (
          <>
            <input style={{ ...S.fieldInput, flex: 2 }} type="text" placeholder="Tipus llevat"
              value={form.llevat_tipus ?? ''}
              onChange={e => setForm(f => ({ ...f, llevat_tipus: e.target.value }))} />
            <input style={{ ...S.fieldInput, width: '50px', flex: 'none', marginLeft: '8px' }}
              type="number" placeholder="g" value={form.llevat_pes_g ?? ''}
              onChange={e => setForm(f => ({ ...f, llevat_pes_g: parseFloat(e.target.value) || null }))} />
            <span style={{ fontSize: '10px', color: colors.text3, marginLeft: '4px' }}>g</span>
          </>
        )}
      </div>
      <div style={S.fieldRow}>
        <span style={S.fieldLabel}>Dins caixa</span>
        <input type="checkbox" checked={form.dins_caixa ?? true}
          onChange={e => setForm(f => ({ ...f, dins_caixa: e.target.checked }))} />
      </div>
      <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={S.sectionHead}>Origen (ebullidors / suc directe)</div>
        {origens.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
            <select style={{ ...S.fieldSelect, width: '90px', flex: 'none' }}
              value={o.tipus} onChange={e => updateOrigen(i, 'tipus', e.target.value)}>
              {ebullidors.length > 0 && <option value="ebullidor">Ebullidor</option>}
              {sucsDirectes.length > 0 && <option value="suc">Suc directe</option>}
            </select>
            <select style={{ ...S.fieldSelect, flex: 2 }}
              value={o.id} onChange={e => updateOrigen(i, 'id', parseInt(e.target.value))}>
              {o.tipus === 'ebullidor'
                ? ebullidors.map(e => <option key={e.id} value={e.id}>{e.codi}</option>)
                : sucsDirectes.map(s => <option key={s.id} value={s.id}>{s.codi}</option>)}
            </select>
            <input style={{ ...S.fieldInput, width: '55px', flex: 'none' }}
              type="number" value={o.vol_l || ''} placeholder="l"
              onChange={e => updateOrigen(i, 'vol_l', parseFloat(e.target.value) || 0)} />
            <span style={{ fontSize: '10px', color: colors.text3 }}>l</span>
            <button onClick={() => setOrigens(o => o.filter((_, j) => j !== i))}
              style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
          </div>
        ))}
        <button onClick={addOrigen} style={S.btnAdd}>+ Afegir origen</button>
      </div>
      <FieldInput label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v as string }))} />
      <CardFootEdit onSave={save} onCancel={() => setEditing(false)} onDelete={onDelete} saving={saving} />
    </Card>
  )
}

export default function FaseFermentat({ data, compact }: Props) {
  const router = useRouter()
  const [fermentadors, setFermentadors] = useState<(Partial<FermentadorAmbOrigen> & { _local?: boolean })[]>(data.fermentadors)

  function addFermentador() {
    setFermentadors(f => [...f, {
      codi: `F${f.length + 1}`, jornada_id: data.jornada.id,
      llevat_afegit: false, dins_caixa: true,
      fermentador_origen: [], _local: true,
    }])
  }

  async function saveFermentador(idx: number, form: Partial<FermentadorAmbOrigen>) {
    const f = fermentadors[idx]
    const origens = form.fermentador_origen ?? []
    if (f.id) {
      await supabase.from('fermentador').update({
        lot: form.lot || null, slot: form.slot, perol: form.perol, vol_l: form.vol_l,
        llevat_afegit: form.llevat_afegit, llevat_tipus: form.llevat_tipus, llevat_pes_g: form.llevat_pes_g,
        dins_caixa: form.dins_caixa, temp_sp_c: form.temp_sp_c, temp_avg_c: form.temp_avg_c,
        sg_inicial: form.sg_inicial, sg_final: form.sg_final,
        data_inici: form.data_inici, durada_dies: form.durada_dies, notes: form.notes,
      }).eq('id', f.id)
      await supabase.from('fermentador_origen').delete().eq('fermentador_id', f.id)
      if (origens.length > 0) {
        await supabase.from('fermentador_origen').insert(origens.map(o => ({
          fermentador_id: f.id!, ebullidor_id: o.ebullidor_id,
          suc_directe_id: o.suc_directe_id, vol_l: o.vol_l,
        })))
      }
    } else {
      const { data: nou } = await supabase.from('fermentador').insert({
        jornada_id: data.jornada.id, codi: form.codi!, lot: form.lot || null,
        slot: form.slot, perol: form.perol, vol_l: form.vol_l,
        llevat_afegit: form.llevat_afegit ?? false, llevat_tipus: form.llevat_tipus,
        llevat_pes_g: form.llevat_pes_g, dins_caixa: form.dins_caixa ?? true,
        temp_sp_c: form.temp_sp_c, temp_avg_c: form.temp_avg_c,
        sg_inicial: form.sg_inicial, sg_final: form.sg_final,
        data_inici: form.data_inici, durada_dies: form.durada_dies, notes: form.notes,
      }).select().single()
      if (nou && origens.length > 0) {
        await supabase.from('fermentador_origen').insert(origens.map(o => ({
          fermentador_id: nou.id, ebullidor_id: o.ebullidor_id,
          suc_directe_id: o.suc_directe_id, vol_l: o.vol_l,
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
      {fermentadors.length === 0 && <div style={{ fontSize: '10px', color: colors.text3, padding: '8px 12px' }}>Cap fermentador</div>}
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
        <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fermentadors</span>
        <button onClick={addFermentador} style={S.btnAdd}>+ Afegir fermentador</button>
      </div>
      {fermentadors.length === 0 && (
        <div style={{ border: `0.5px dashed ${colors.border}`, borderRadius: '8px', padding: '32px', textAlign: 'center', color: colors.text3, fontSize: '12px' }}>
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
