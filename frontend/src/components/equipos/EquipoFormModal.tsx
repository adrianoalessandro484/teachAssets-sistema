import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FormField } from '@/components/shared/FormField'
import { useToast } from '@/hooks/useToast'
import { equipoService } from '@/services/equipoService'
import { CATEGORIA_LABELS, type CategoriaEquipo, type Equipo } from '@/types'

interface EquipoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipo?: Equipo | null
  onSaved: () => void
}

const CATEGORIAS = Object.keys(CATEGORIA_LABELS) as CategoriaEquipo[]

export function EquipoFormModal({ open, onOpenChange, equipo, onSaved }: EquipoFormModalProps) {
  const isEditing = Boolean(equipo)
  const { showSuccess, showError } = useToast()

  const [codigoPatrimonial, setCodigoPatrimonial] = useState('')
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState<CategoriaEquipo>('Laptop')
  const [marca, setMarca] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setCodigoPatrimonial(equipo?.codigoPatrimonial ?? '')
      setNombre(equipo?.nombre ?? '')
      setCategoria(equipo?.categoria ?? 'Laptop')
      setMarca(equipo?.marca ?? '')
      setUbicacion(equipo?.ubicacion ?? '')
      setErrors({})
    }
  }, [open, equipo])

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!codigoPatrimonial.trim()) {
      nextErrors.codigoPatrimonial = 'El código patrimonial es obligatorio.'
    }
    if (!nombre.trim()) nextErrors.nombre = 'El nombre del equipo es obligatorio.'
    if (!marca.trim()) nextErrors.marca = 'La marca es obligatoria.'
    if (!ubicacion.trim()) nextErrors.ubicacion = 'La ubicación es obligatoria.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload = {
        codigoPatrimonial: codigoPatrimonial.trim().toUpperCase(),
        nombre: nombre.trim(),
        categoria,
        marca: marca.trim(),
        ubicacion: ubicacion.trim(),
      }

      if (isEditing && equipo) {
        await equipoService.update(equipo.id, payload)
        showSuccess('Equipo actualizado', 'Los datos del activo se actualizaron correctamente.')
      } else {
        await equipoService.create(payload)
        showSuccess('Equipo registrado', 'El activo tecnológico fue incorporado al inventario.')
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      showError('No se pudo guardar el equipo', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Equipo Tecnológico' : 'Registrar Equipo Tecnológico'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza las especificaciones y ubicación del activo.'
              : 'Ingresa los datos del equipo. El código patrimonial debe ser único.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Código Patrimonial"
              htmlFor="eq-codigo"
              error={errors.codigoPatrimonial}
              required
            >
              <Input
                id="eq-codigo"
                value={codigoPatrimonial}
                onChange={(e) => setCodigoPatrimonial(e.target.value)}
                placeholder="Ej. INV-LAP-010"
              />
            </FormField>

            <FormField label="Categoría" htmlFor="eq-categoria" required>
              <Select
                id="eq-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaEquipo)}
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORIA_LABELS[cat]}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Nombre / Modelo" htmlFor="eq-nombre" error={errors.nombre} required>
            <Input
              id="eq-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. MacBook Pro 14 M3"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Marca" htmlFor="eq-marca" error={errors.marca} required>
              <Input
                id="eq-marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej. Apple, Lenovo, Dell"
              />
            </FormField>

            <FormField label="Ubicación" htmlFor="eq-ubicacion" error={errors.ubicacion} required>
              <Input
                id="eq-ubicacion"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej. Almacén TI - Piso 3"
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar equipo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
