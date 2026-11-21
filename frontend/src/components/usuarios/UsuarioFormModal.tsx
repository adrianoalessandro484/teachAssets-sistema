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
import { usuarioService } from '@/services/usuarioService'
import { ROL_LABELS, type RolUsuario, type Usuario } from '@/types'

interface UsuarioFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: Usuario | null
  onSaved: () => void
}

const ROLES: RolUsuario[] = ['Administrador', 'ResponsableTecnologia', 'Colaborador']

export function UsuarioFormModal({ open, onOpenChange, usuario, onSaved }: UsuarioFormModalProps) {
  const isEditing = Boolean(usuario)
  const { showSuccess, showError } = useToast()

  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [area, setArea] = useState('')
  const [rol, setRol] = useState<RolUsuario>('Colaborador')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setNombres(usuario?.nombres ?? '')
      setApellidos(usuario?.apellidos ?? '')
      setCorreo(usuario?.correo ?? '')
      setPassword('')
      setArea(usuario?.area ?? '')
      setRol(usuario?.rol ?? 'Colaborador')
      setErrors({})
    }
  }, [open, usuario])

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!nombres.trim()) nextErrors.nombres = 'Los nombres son obligatorios.'
    if (!apellidos.trim()) nextErrors.apellidos = 'Los apellidos son obligatorios.'
    if (!correo.trim()) {
      nextErrors.correo = 'El correo electrónico es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nextErrors.correo = 'El formato del correo electrónico no es válido.'
    }
    if (!isEditing && password.length < 6) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
    } else if (isEditing && password && password.length < 6) {
      nextErrors.password = 'La nueva contraseña debe tener al menos 6 caracteres.'
    }
    if (!area.trim()) nextErrors.area = 'El área funcional es obligatoria.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      if (isEditing && usuario) {
        await usuarioService.update(usuario.id, {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          correo: correo.trim(),
          password: password.trim() || undefined,
          area: area.trim(),
          rol,
        })
        showSuccess('Usuario actualizado', 'Los datos del usuario se actualizaron correctamente.')
      } else {
        await usuarioService.create({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          correo: correo.trim(),
          password,
          area: area.trim(),
          rol,
        })
        showSuccess('Usuario registrado', 'El usuario fue creado correctamente.')
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      showError('No se pudo guardar el usuario', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuario' : 'Registrar Usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la información del colaborador o administrador.'
              : 'Completa los campos para dar de alta a un nuevo usuario en TechAsset.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nombres" htmlFor="u-nombres" error={errors.nombres} required>
              <Input
                id="u-nombres"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej. Ana María"
              />
            </FormField>

            <FormField label="Apellidos" htmlFor="u-apellidos" error={errors.apellidos} required>
              <Input
                id="u-apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Torres Paredes"
              />
            </FormField>
          </div>

          <FormField label="Correo electrónico" htmlFor="u-correo" error={errors.correo} required>
            <Input
              id="u-correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@innovatech.com"
            />
          </FormField>

          <FormField
            label={isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            htmlFor="u-password"
            error={errors.password}
            required={!isEditing}
          >
            <Input
              id="u-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Área" htmlFor="u-area" error={errors.area} required>
              <Input
                id="u-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ej. Desarrollo de Software"
              />
            </FormField>

            <FormField label="Rol" htmlFor="u-rol" required>
              <Select id="u-rol" value={rol} onChange={(e) => setRol(e.target.value as RolUsuario)}>
                {ROLES.map((item) => (
                  <option key={item} value={item}>
                    {ROL_LABELS[item]}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
