import type { Request, Response } from 'express';
import User from "../models/User"
import { checkPassword, hashPassword } from '../utils/auth';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';


export class AuthController {


    static createAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const { password, email } = req.body

            // Verificar si el usuario ya existe
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('El usuario ya existe')
                res.status(409).json({ error: error.message })
                return
            }

            // Crea el nuevo usuario
            const user = new User(req.body)

            // Hash password
            user.password = await hashPassword(password)

            // Generar token de verificación
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar el email de confirmación
            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token,
            });
            // Guardar el usuario y el token en la base de datos

            await Promise.allSettled([
                user.save(),
                token.save()
            ])

            res.send('Usuario creado correctamente')
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' })

        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(401).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true
            await Promise.allSettled([
                user.save(),
                tokenExists.deleteOne()
            ])

            res.send('Usuario confirmado correctamente')
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })

            // Verificar si el usuario existe
            if (!user) {
                const error = new Error('El usuario no existe')
                res.status(404).json({ error: error.message })
                return
            }

            // Verificar si el usuario esta confirmado
            if (!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                // Enviar el email de confirmación
                await AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token,
                });

                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un email de confirmacion')
                res.status(401).json({ error: error.message })
                return
            }
            // Verificar la contraseña
            const isPasswordCorrect = await checkPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('La contraseña es incorrecta')
                res.status(401).json({ error: error.message })
                return
            }

            const token = generateJWT({ id: user.id })
            res.send(token)

        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Verificar si el usuario ya existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(404).json({ error: error.message })
                return
            }

            // Verificar si el usuario ya esta confirmado
            if (user.confirmed) {
                const error = new Error('El usuario ya esta confirmado')
                res.status(403).json({ error: error.message })
                return
            }

            // Generar token de verificación
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar el email de confirmación
            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token,
            });
            // Guardar el usuario y el token en la base de datos

            await Promise.allSettled([
                user.save(),
                token.save()
            ])

            res.send('Se envio un nuevo Token de confirmacion al email')
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' })

        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Verificar si el usuario ya existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(404).json({ error: error.message })
                return
            }

            // Generar token de verificación
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            await token.save()

            // Enviar el email de confirmación
            await AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token,
            });

            res.send('Recuperacion de contraseña, se envio un email al usuario')
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' })

        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(401).json({ error: error.message })
                return
            }

            res.send('Token valido, puedes cambiar la contraseña')
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(401).json({ error: error.message })
                return
            }

            // Verificar si el usuario ya existe
            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)

            // Almacenar el nuevo password en la base de datos y eliminar el token
            await Promise.allSettled([
                user.save(),
                tokenExists.deleteOne()
            ])

            // Enviar el email de confirmación

            res.send('El password se actualizo correctamente')
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }

    static user = async (req: Request, res: Response): Promise<void> => {
        res.json(req.user)
        return
    }

    static updateProfile = async (req: Request, res: Response): Promise<void> => {
        const { name, email } = req.body

        const userExists = await User.findOne({ email })
        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error('El email ya esta en uso')
            res.status(409).json({ error: error.message })
            return
        }
        // Verificar si el usuario existe
        if (!req.user) {
            const error = new Error('El usuario no existe')
            res.status(404).json({ error: error.message })
            return
        }


        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response): Promise<void> => {
        const { currentPassword, password } = req.body

        const user = await User.findById(req.user.id)

        // Verificar la contraseña
        const isPasswordCorrect = await checkPassword(currentPassword, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('La contraseña actual es incorrecta')
            res.status(401).json({ error: error.message })
            return
        }


        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('Contraseña actualizada correctamente')
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' })
        }

    }
}