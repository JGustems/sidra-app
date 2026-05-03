'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Fermentador, EmbotellAtBloc, Embotellat, TipusAmpolla, TipusTap, TipusSucre } from '@/lib/types'
import { S, colors } from '@/lib/theme'
import Card, { CardHead, CardFootRead, CardFootEdit, FieldRead, FieldInput, FieldAuto, CardCompact } from '@/components/ui/Card'

type EmbotellatAmbBlocs = Embotellat & { embotellat_bloc: EmbotellAtBloc[] }
type FermentadorAmbEmbotellat = Fermentador & { embotellat: EmbotellatAmbBlocs[] }

interface Props {
  data: {
    jornada: { id: number }
    fermentadors: FermentadorAmbEmbotellat[]
    tipusAmpolles: TipusAmpolla[]
    tipusTaps: TipusTap[]
    tipusSucres: TipusSucre[]
  }
  compact?: boolean
}

function formatData(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

function generaCSV(blocs: EmbotellAtBloc[], lot: string, data: string, ampolles: TipusAmpolla[], taps: TipusTap[], sucres: TipusSucre[]) {
  const files: string[] = []
  files.push('Num,Lot,N Amp,Tag,Data,Codi')

  // Recollim totes les ampolles
  const todesAmpolles: { num: number; tag: string }[] = []
  for (const bloc of blocs) {
    const ampolla = ampolles.find(a => a.id === bloc.ampolla_id)
    const tap = taps.find(t => t.id === bloc.tap_id)
    const sucre = sucres.find(s => s.id === bloc.sucre_id)
    const tag = `${ampolla?.codi ?? 'A?'}.${tap?.codi ?? 'T?'}.${sucre?.codi ?? 'S?'}`
    for (let n = bloc.num_inici; n <= bloc.num_final; n++) {
      todesAmpolles.push({ num: n, tag })
    }
  }

  // De l'última a la primera
  todesAmpolles.sort((a, b) => b.num - a.num)

  todesAmpolles.forEach((a, i) => {
    const nAmp = String(a.num).padStart(3, '0')
    const codi = `${lot}-${nAmp}-${a.tag}`
    files.push(`${i + 1},${lot},${nAmp},${a.tag},${data},${codi}`)
  })

  return files.join('\n')
}

function BlocRow({ bloc, ampolles, taps, sucres, numInici, onDelete, onUpdate }: {
  bloc: Partial<EmbotellAtBloc> & { _local?: boolean }
  ampolles: TipusAmpolla[]
  taps: TipusTap[]
  sucres: TipusSucre[]
  numInici: number
  onDelete: () => void
  onUpdate: (b: Partial<EmbotellAtBloc>) => void
}) {
  const ampolla = ampolles.find(a => a.id === bloc.ampolla_id)
  const tap = taps.find(t => t.id === bloc.tap_id)
  const sucre = sucres.find(s => s.id === bloc.sucre_id)
  const numFinal = numInici + (bloc.quantitat ?? 0) - 1
  const tag = ampolla && tap && sucre ? `${ampolla.codi}.${tap.codi}.${sucre.codi}` : '—'
  const volL = ampolla ? ((bloc.quantitat ?? 0) * ampolla.mida_cl / 100).toFixed(2) : '—'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 60px 80px 80px auto',
      gap: '6px', alignItems: 'center',
      padding: '6px 12px',
      borderBottom: `0.5px solid ${colors.bg3}`,
    }}>
      <select
        style={{ ...S.fieldSelect, fontSize: '11px' }}
        value={bloc.ampolla_id ?? ''}
        onChange={e => onUpdate({ ...bloc, ampolla_id: parseInt(e.target.value) })}
      >
        <option value="">Ampolla</option>
        {ampolles.filter(a => a.actiu).map(a => <option key={a.id} value={a.id}>{a.codi} — {a.nom} ({a.mida_cl}cl)</option>)}
      </select>
      <select
        style={{ ...S.fieldSelect, fontSize: '11px' }}
        value={bloc.tap_id ?? ''}
        onChange={e => onUpdate({ ...bloc, tap_id: parseInt(e.target.value) })}
      >
        <option value="">Tap</option>
        {taps.filter(t => t.actiu).map(t => <option key={t.id} value={t.id}>{t.codi} — {t.nom}</option>)}
      </select>
      <select
        style={{ ...S.fieldSelect, fontSize: '11px' }}
        value={bloc.sucre_id ?? ''}
        onChange={e => onUpdate({ ...bloc, sucre_id: parseInt(e.target.value) })}
      >
        <option value="">Sucre</option>
        {sucres.filter(s => s.actiu).map(s => <option key={s.id} value={s.id}>{s.codi} — {s.nom}</option>)}
      </select>
      <input
        style={{ ...S.fieldInput, textAlign: 'center' as const }}
        type="number" min="1"
        value={bloc.quantitat ?? ''}
        placeholder="qty"
        onChange={e => onUpdate({ ...bloc, quantitat: parseInt(e.target.value) || 0 })}
      />
      <span style={{ fontSize: '10px', color: colors.text3, textAlign: 'center' as const }}>
        {bloc.quantitat ? `${numInici}→${numFinal}` : '—'}
      </span>
      <span style={{ fontSize: '10px', color: colors.teal, fontWeight: '500', textAlign: 'center' as const }}>
        {tag !== '—' && bloc.quantitat ? `${volL} l` : '—'}
      </span>
      <button onClick={onDelete} style={{ ...S.btnDel, fontSize: '12px' }}>✕</button>
    </div>
  )
}

function EmbotellatCard({ fermentador, ampolles, taps, sucres, onSave, compact }: {
  fermentador: FermentadorAmbEmbotellat
  ampolles: TipusAmpolla[]
  taps: TipusTap[]
  sucres: TipusSucre[]
  onSave: () => void
  compact?: boolean
}) {
  const embotellat = fermentador.embotellat?.[0]
  const [editing, setEditing] = useState(!embotellat)
  const [dataEmb, setDataEmb] = useState(embotellat?.data_embotellat ?? '')
  const [sgMesura, setSgMesura] = useState<number | null>(embotellat?.sg_mesura ?? null)
  const [blocs, setBlocs] = useState<Partial<EmbotellAtBloc>[]>(embotellat?.embotellat_bloc ?? [])
  const [saving, setSaving] = useState(false)
  const [exportant, setExportant] = useState(false)

  const totalAmpolles = blocs.reduce((s, b) => s + (b.quantitat ?? 0), 0)
  const totalLitres = blocs.reduce((s, b) => {
    const ampolla = ampolles.find(a => a.id === b.ampolla_id)
    return s + ((b.quantitat ?? 0) * (ampolla?.mida_cl ?? 0) / 100)
  }, 0)

  // Calcula num_inici per a cada bloc
  function getNumInici(idx: number) {
    let n = 1
    for (let i = 0; i < idx; i++) n += blocs[i].quantitat ?? 0
    return n
  }

  function addBloc() {
    setBlocs(b => [...b, {
      ampolla_id: ampolles[0]?.id,
      tap_id: taps[0]?.id,
      sucre_id: sucres[0]?.id,
      quantitat: 0,
    }])
  }

  function updateBloc(idx: number, b: Partial<EmbotellAtBloc>) {
    setBlocs(bs => bs.map((item, i) => i === idx ? b : item))
  }

  function deleteBloc(idx: number) {
    setBlocs(bs => bs.filter((_, i) => i !== idx))
  }

  async function save() {
    setSaving(true)
    const router = useRouter()

    // Calcula blocs amb num_inici i num_final i codi
    const blocsCalculats = blocs.map((b, idx) => {
      const numInici = getNumInici(idx)
      const numFinal = numInici + (b.quantitat ?? 0) - 1
      const ampolla = ampolles.find(a => a.id === b.ampolla_id)
      const tap = taps.find(t => t.id === b.tap_id)
      const sucre = sucres.find(s => s.id === b.sucre_id)
      return {
        ...b,
        num_inici: numInici,
        num_final: numFinal,
        codi_embotellat: `${ampolla?.codi}.${tap?.codi}.${sucre?.codi}`,
      }
    })

    if (embotellat?.id) {
      await supabase.from('embotellat').update({
        data_embotellat: dataEmb || null,
        sg_mesura: sgMesura,
        vol_disponible_l: fermentador.vol_l,
      }).eq('id', embotellat.id)
      await supabase.from('embotellat_bloc').delete().eq('embotellat_id', embotellat.id)
      if (blocsCalculats.length > 0) {
        await supabase.from('embotellat_bloc').insert(blocsCalculats.map(b => ({
          embotellat_id: embotellat.id,
          ampolla_id: b.ampolla_id!,
          tap_id: b.tap_id!,
          sucre_id: b.sucre_id!,
          quantitat: b.quantitat!,
          num_inici: b.num_inici!,
          num_final: b.num_final!,
          codi_embotellat: b.codi_embotellat,
        })))
      }
    } else {
      const { data: nouEmb } = await supabase.from('embotellat').insert({
        fermentador_id: fermentador.id,
        data_embotellat: dataEmb || null,
        sg_mesura: sgMesura,
        vol_disponible_l: fermentador.vol_l,
      }).select().single()
      if (nouEmb && blocsCalculats.length > 0) {
        await supabase.from('embotellat_bloc').insert(blocsCalculats.map(b => ({
          embotellat_id: nouEmb.id,
          ampolla_id: b.ampolla_id!,
          tap_id: b.tap_id!,
          sucre_id: b.sucre_id!,
          quantitat: b.quantitat!,
          num_inici: b.num_inici!,
          num_final: b.num_final!,
          codi_embotellat: b.codi_embotellat,
        })))
      }
    }
    setSaving(false)
    setEditing(false)
    onSave()
  }

  function exportarCSV() {
    const blocsCalculats = blocs.map((b, idx) => {
      const numInici = getNumInici(idx)
      return {
        ...b,
        num_inici: numInici,
        num_final: numInici + (b.quantitat ?? 0) - 1,
        codi_embotellat: '',
      } as EmbotellAtBloc
    })
    const csv = generaCSV(blocsCalculats, fermentador.lot ?? '', formatData(dataEmb), ampolles, taps, sucres)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `niimbot-${fermentador.lot ?? 'lot'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (compact) return (
    <CardCompact
      id={fermentador.codi}
      badge={fermentador.lot ? `LOT ${fermentador.lot}` : undefined}
      badgeColor="amber"
      fields={[
        { label: 'Ampolles', value: totalAmpolles > 0 ? totalAmpolles : null },
        { label: 'Vol',      value: totalLitres > 0 ? `${totalLitres.toFixed(2)} l` : null },
        { label: 'Data',     value: dataEmb ? formatData(dataEmb) : null },
      ]}
    />
  )

  if (!editing) return (
    <Card>
      <div style={S.cardHead}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={S.cardId}>{fermentador.codi}</span>
          {fermentador.lot && <span style={S.lotBadge}>LOT {fermentador.lot}</span>}
        </div>
        <span style={S.badgeSaved}>desat</span>
      </div>
      <FieldRead label="Data embotellat" value={dataEmb ? formatData(dataEmb) : null} />
      <FieldRead label="SG mesura" value={sgMesura} />
      <FieldRead label="Vol disponible" value={fermentador.vol_l ? `${fermentador.vol_l} l` : null} />
      <FieldRead label="Total ampolles" value={totalAmpolles > 0 ? totalAmpolles : null} />
      <FieldRead label="Total litres" value={totalLitres > 0 ? `${totalLitres.toFixed(2)} l` : null} />

      {blocs.length > 0 && (
        <div style={{ padding: '7px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
          <div style={S.sectionHead}>Blocs d'ampolles</div>
          {blocs.map((b, idx) => {
            const ampolla = ampolles.find(a => a.id === b.ampolla_id)
            const tap = taps.find(t => t.id === b.tap_id)
            const sucre = sucres.find(s => s.id === b.sucre_id)
            const numInici = getNumInici(idx)
            const numFinal = numInici + (b.quantitat ?? 0) - 1
            const tag = `${ampolla?.codi}.${tap?.codi}.${sucre?.codi}`
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', alignItems: 'center' }}>
                <span style={{ color: colors.teal, fontFamily: 'DM Mono, monospace' }}>{tag}</span>
                <span style={{ color: colors.text2 }}>{b.quantitat} amp · {String(numInici).padStart(3,'0')}→{String(numFinal).padStart(3,'0')}</span>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ ...S.cardFoot, gap: '8px' }}>
        <button
          style={S.btnDel}
          onClick={() => setEditing(true)}
        >
          editar
        </button>
        <button
          onClick={exportarCSV}
          style={{ ...S.btnEdit, color: colors.teal, borderColor: colors.teal }}
        >
          ↓ Niimbot CSV
        </button>
      </div>
    </Card>
  )

  return (
    <Card editing>
      <div style={S.cardHead}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={S.cardId}>{fermentador.codi}</span>
          {fermentador.lot && <span style={S.lotBadge}>LOT {fermentador.lot}</span>}
        </div>
        <span style={S.badgeEdit}>editant</span>
      </div>

      <FieldInput
        label="Data embotellat"
        value={dataEmb}
        type="date"
        onChange={v => setDataEmb(v as string ?? '')}
      />
      <FieldInput
        label="SG mesura"
        value={sgMesura}
        type="number"
        step="0.001"
        onChange={v => setSgMesura(v as number)}
      />
      <FieldAuto label="Vol disponible" value={fermentador.vol_l ? `${fermentador.vol_l} l` : null} />

      <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 60px 80px 80px auto', gap: '6px', marginBottom: '6px' }}>
          <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase' as const }}>Ampolla</span>
          <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase' as const }}>Tap</span>
          <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase' as const }}>Sucre</span>
          <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase' as const, textAlign: 'center' as const }}>Qty</span>
          <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase' as const, textAlign: 'center' as const }}>Núm</span>
          <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase' as const, textAlign: 'center' as const }}>Vol</span>
          <span></span>
        </div>
        {blocs.map((b, idx) => (
          <BlocRow
            key={idx}
            bloc={b}
            ampolles={ampolles}
            taps={taps}
            sucres={sucres}
            numInici={getNumInici(idx)}
            onDelete={() => deleteBloc(idx)}
            onUpdate={nb => updateBloc(idx, nb)}
          />
        ))}
        <button onClick={addBloc} style={{ ...S.btnAdd, marginTop: '8px' }}>+ Afegir bloc</button>
      </div>

      <div style={{ padding: '8px 12px', borderBottom: `0.5px solid ${colors.bg3}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: colors.text3 }}>Total ampolles:</span>
          <span style={{ color: colors.text, fontWeight: '500' }}>{totalAmpolles}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
          <span style={{ color: colors.text3 }}>Total litres:</span>
          <span style={{ color: totalLitres > (fermentador.vol_l ?? 0) ? colors.amberHi : colors.teal, fontWeight: '500' }}>
            {totalLitres.toFixed(2)} l {fermentador.vol_l ? `de ${fermentador.vol_l} l` : ''}
          </span>
        </div>
      </div>

      <div style={S.cardFoot}>
        <button style={S.btnDel} onClick={() => setEditing(false)}>Cancel·lar</button>
        <button style={S.btnSave} onClick={save} disabled={saving}>
          {saving ? 'Desant...' : 'Desar'}
        </button>
      </div>
    </Card>
  )
}

export default function FaseEmbotellat({ data, compact }: Props) {
  const router = useRouter()

  if (compact) return (
    <div>
      {data.fermentadors.length === 0 && (
        <div style={{ fontSize: '10px', color: colors.text3, padding: '8px 12px' }}>Cap embotellat</div>
      )}
      {data.fermentadors.map(f => (
        <EmbotellatCard
          key={f.id} fermentador={f} compact
          ampolles={data.tipusAmpolles} taps={data.tipusTaps} sucres={data.tipusSucres}
          onSave={() => router.refresh()}
        />
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '9px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Embotellat</span>
      </div>
      {data.fermentadors.length === 0 && (
        <div style={{ border: `0.5px dashed ${colors.border}`, borderRadius: '8px', padding: '32px', textAlign: 'center', color: colors.text3, fontSize: '12px' }}>
          Primer afegeix fermentadors
        </div>
      )}
      {data.fermentadors.map(f => (
        <EmbotellatCard
          key={f.id} fermentador={f}
          ampolles={data.tipusAmpolles} taps={data.tipusTaps} sucres={data.tipusSucres}
          onSave={() => router.refresh()}
        />
      ))}
    </div>
  )
}
