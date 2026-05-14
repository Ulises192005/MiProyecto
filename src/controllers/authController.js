const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {

    try {

        const { nombre, correo, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING *',
            [nombre, correo, passwordHash]
        );

        res.status(201).json({
            message: 'Usuario registrado',
            user: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error del servidor'
        });
    }
};

const login = async (req, res) => {

    try {

        const { correo, password } = req.body;

        const userResult = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1',
            [correo]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: 'Contraseña incorrecta'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                correo: user.correo,
                rol: user.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.json({
            message: 'Login exitoso',
            token
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error del servidor'
        });
    }
};

module.exports = {
    register,
    login
};