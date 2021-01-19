import React, {useState, useEffect, useContext} from 'react';
import '../index.css'
import {useMessage} from "../hooks/message";
import {useHttp} from '../hooks/http'
import {AuthContext} from "../context/AuthContext";
import {Link} from "react-router-dom";

const AuthPage = () => {
    let className = 'password-control';
    let input = document.getElementById('password')
    const [toggle, setToggle] = useState(false)

    if (toggle) {
        input.setAttribute("type", "text")
        className += ' view';
    }
    const setTogglePassword = () => {
        input.setAttribute("type", "password")
        setToggle(!toggle)
    }

    const auth = useContext(AuthContext)
    const message = useMessage()
    const {loading, request, error, clearError} = useHttp()
    const [form, setForm] = useState({
        email: '', password: ''
    })

    useEffect(() => {
        message(error)
        clearError()
    }, [error, message, clearError])

    useEffect(() => {
        window.M.updateTextFields()
    }, [])

    const changeHandler = event => {
        setForm({...form, [event.target.name]: event.target.value})
    }

    const registerHandler = async () => {
        try {
            const data = await request('/api/auth/register', 'POST', {...form})
            message(data.message)
        } catch (e) {
        }
    }

    const loginHandler = async () => {
        try {
            const data = await request('/api/auth/login', 'POST', {...form})
            auth.login(data.token, data.userId)
        } catch (e) {
        }
    }

    const cleanHandler = () => {
        setForm({email: '', password: ''})
    }

    return (
        <div className="row">
            <div className="col s6 offset-s3">
                <h1>Сократи Ссылку</h1>
                <div className="card blue darken-1">
                    <div className="card-content white-text">
                        <span className="card-title">Авторизация</span>
                        <div>

                            <div className="input-field">
                                <input
                                    placeholder="Введите email"
                                    id="email"
                                    type="text"
                                    name="email"
                                    className="yellow-input"
                                    value={form.email}
                                    onChange={changeHandler}
                                />
                                <label htmlFor="email">Email</label>
                            </div>

                            <div className="input-field">
                                <input
                                    placeholder="Введите пароль"
                                    id="password"
                                    type="password"
                                    name="password"
                                    className="yellow-input"
                                    value={form.password}
                                    onChange={changeHandler}
                                />
                                <label htmlFor="email">Пароль</label>
                                <Link to="/" className={className} onClick={setTogglePassword}/>
                            </div>
                        </div>

                    </div>
                    <div className="card-action">
                        <button
                            className="btn yellow darken-4"
                            style={{marginRight: 10}}
                            onClick={loginHandler}
                            disabled={loading}
                        >
                            Войти
                        </button>
                        <button
                            className="btn grey lighten-1 black-text"
                            style={{marginRight: 10}}
                            onClick={registerHandler}
                            disabled={loading}
                        >
                            Регистрация
                        </button>
                        <button
                            className="btn red accent-4 black-text"
                            onClick={cleanHandler}
                            disabled={loading}
                        >
                            Очистить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;