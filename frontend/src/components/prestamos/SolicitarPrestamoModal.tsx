import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { useToast } from '@/hooks/useToast'
import { prestamoService } from '@/services/prestamoService'
import { CATEGORIA_LABELS, type Equipo } from '@/types'

interface SolicitarPrestamoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equiposDisponibles: Equipo[]
  preselectedEquipoId?: string
  onSaved: () => void
}

function toLocalDateTimeInput(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function getStartOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
}

export function SolicitarPrestamoModal({
  open,
  onOpenChange,
  equiposDisponibles,
  preselectedEquipoId,
  onSaved,
}: SolicitarPrestamoModalProps) {
  const { showSuccess, showError } = useToast()

  const [equipoId, setEquipoId] = useState('')
  const [fechaPrestamo, setFechaPrestamo] = useState('')
  const [fechaDevolucionEstimada, setFechaDevolucionEstimada] = useState('')
  const [observacion, setObservacion] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const minTodayDateTime = useMemo(() => toLocalDateTimeInput(getStartOfToday()), [open])

  const equipoOptions = useMemo<ComboboxOption[]>(
    () =>
      equiposDisponibles.map((eq) => ({
        value: eq.id,
        badge: eq.codigoPatrimonial,
        label: eq.nombre,
        description: `${CATEGORIA_LABELS[eq.categoria]} • ${eq.marca} • ${eq.ubicacion}`,
        searchText: `${eq.codigoPatrimonial} ${eq.nombre} ${CATEGORIA_LABELS[eq.categoria]} ${eq.marca} ${eq.ubicacion}`,
      })),
    [equiposDisponibles],
  )

  useEffect(() => {
    if (open) {
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      setEquipoId(preselectedEquipoId || equiposDisponibles[0]?.id || '')
      setFechaPrestamo(toLocalDateTimeInput(now))
      setFechaDevolucionEstimada(toLocalDateTimeInput(nextWeek))
      setObservacion('')
      setErrors({})
    }
  }, [open, preselectedEquipoId, equiposDisponibles])

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    const startOfToday = getStartOfToday()

    if (!equipoId) nextErrors.equipoId = 'Debe seleccionar un equipo disponible.'

    if (!fechaPrestamo) {
      nextErrors.fechaPrestamo = 'La fecha de préstamo es obligatoria.'
    } else if (new Date(fechaPrestamo) < startOfToday) {
      nextErrors.fechaPrestamo = 'La fecha de préstamo debe ser desde hoy en adelante.'
    }

    if (!fechaDevolucionEstimada) {
      nextErrors.fechaDevolucionEstimada = 'La fecha estimada de devolución es obligatoria.'
    } else if (new Date(fechaDevolucionEstimada) < startOfToday) {
      nextErrors.fechaDevolucionEstimada = 'La fecha de devolución debe ser desde hoy en adelante.'
    } else if (fechaPrestamo && new Date(fechaDevolucionEstimada) <= new Date(fechaPrestamo)) {
      nextErrors.fechaDevolucionEstimada =
        'La fecha de devolución debe ser posterior a la fecha de préstamo.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await prestamoService.solicitar({
        equipoId,
        fechaPrestamo: new Date(fechaPrestamo).toISOString(),
        fechaDevolucionEstimada: new Date(fechaDevolucionEstimada).toISOString(),
        observacion: observacion.trim() || undefined,
      })
      showSuccess(
        'Solicitud enviada',
        'Tu solicitud quedó registrada en estado Pendiente para aprobación del Responsable de Tecnología.',
      )
      onOpenChange(false)
      onSaved()
    } catch (err) {
      showError('No se pudo registrar la solicitud', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const minDevolucionDateTime =
    fechaPrestamo && fechaPrestamo > minTodayDateTime ? fechaPrestamo : minTodayDateTime

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Préstamo de Equipo</DialogTitle>
          <DialogDescription>
            Busca y selecciona un equipo disponible e indica fechas desde hoy en adelante.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Equipo disponible" htmlFor="pr-equipo" error={errors.equipoId} required>
            <Combobox
              id="pr-equipo"
              options={equipoOptions}
              value={equipoId}
              onChange={(nextVal) => {
                setEquipoId(nextVal)
                setErrors((prev) => ({ ...prev, equipoId: '' }))
              }}
              placeholder={
                equiposDisponibles.length === 0
                  ? 'No hay equipos disponibles en este momento'
                  : 'Buscar y seleccionar equipo...'
              }
              searchPlaceholder="Buscar por código, nombre, marca o ubicación..."
              emptyMessage="No hay equipos disponibles que coincidan."
              disabled={equiposDisponibles.length === 0}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Fecha de préstamo" htmlFor="pr-inicio" error={errors.fechaPrestamo} required>
              <Input
                id="pr-inicio"
                type="datetime-local"
                min={minTodayDateTime}
                value={fechaPrestamo}
                onChange={(e) => {
                  const val = e.target.value
                  setFechaPrestamo(val)
                  setErrors((prev) => ({ ...prev, fechaPrestamo: '' }))
                }}
              />
            </FormField>

            <FormField
              label="Devolución estimada"
              htmlFor="pr-fin"
              error={errors.fechaDevolucionEstimada}
              required
            >
              <Input
                id="pr-fin"
                type="datetime-local"
                min={minDevolucionDateTime}
                value={fechaDevolucionEstimada}
                onChange={(e) => {
                  setFechaDevolucionEstimada(e.target.value)
                  setErrors((prev) => ({ ...prev, fechaDevolucionEstimada: '' }))
                }}
              />
            </FormField>
          </div>

          <FormField label="Motivo / Observación de solicitud" htmlFor="pr-obs">
            <Textarea
              id="pr-obs"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej. Asignación para proyecto con cliente..."
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || equiposDisponibles.length === 0}>
              {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
