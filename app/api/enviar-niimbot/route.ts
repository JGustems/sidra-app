import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function generaCSV(blocs: {
  num_inici: number
  num_final: number
  ampolla_codi: string
  tap_codi: string
  sucre_codi: string
}[], lot: string, dataEmb: string): string {
  const lotFormatat = lot.padStart(4, '0')
  const files: string[] = ['Numero,Lot,N Ampolla,Tag,Data,Codi']

  const todesAmpolles: { num: number; tag: string }[] = []

  for (const bloc of blocs) {
    const tag = `${bloc.ampolla_codi}.${bloc.tap_codi}.${bloc.sucre_codi}`
    for (let n = bloc.num_inici; n <= bloc.num_final; n++) {
      todesAmpolles.push({ num: n, tag })
    }
  }

  // Ordre invers
  todesAmpolles.sort((a, b) => b.num - a.num)

  todesAmpolles.forEach((a, i) => {
    const nAmp = String(a.num).padStart(3, '0')
    const codi = `${lotFormatat}-${nAmp}-${a.tag}`
    files.push(`${i + 1},${lotFormatat},${nAmp},${a.tag},${dataEmb},${codi}`)
  })

  return files.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { blocs, lot, dataEmb, destinataris } = await req.json()

    if (!destinataris || destinataris.length === 0) {
      return NextResponse.json({ error: 'Cap destinatari seleccionat' }, { status: 400 })
    }

    const csv = generaCSV(blocs, lot, dataEmb)
    const lotFormatat = lot.padStart(4, '0')
    const nomFitxer = `niimbot-${lotFormatat}.csv`

    const csvBase64 = Buffer.from(csv, 'utf-8').toString('base64')

    await resend.emails.send({
      from: 'Sidra <onboarding@resend.dev>',
      to: destinataris,
      subject: `Etiquetes Niimbot — LOT ${lotFormatat}`,
      html: `
        <div style="font-family: monospace; padding: 20px;">
          <h2>Etiquetes LOT ${lotFormatat}</h2>
          <p>Data d'embotellat: ${dataEmb}</p>
          <p>Total ampolles: ${blocs.reduce((s: number, b: { num_inici: number; num_final: number }) => s + (b.num_final - b.num_inici + 1), 0)}</p>
          <p>Adjunt trobaràs el fitxer CSV per importar a Niimbot.</p>
        </div>
      `,
      attachments: [
        {
          filename: nomFitxer,
          content: csvBase64,
        }
      ]
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error enviant email' }, { status: 500 })
  }
}
