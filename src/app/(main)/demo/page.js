'use client';

import { useFetch } from "react-hooks-toolkit-amanyadav";



const Demo = () => {

    const { refetch: login, isLoading } = useFetch({
        method: 'POST',
        url: `/api/auth/login`,
        onSuccess: (res) => {
            console.log('Login:', res);
        },
        onError: (err) => {
            console.error(err.message || 'An error occurred');
        },
    });


    const { refetch: registerUser } = useFetch({
        method: 'POST',
        url: `/api/auth/register`,
        onSuccess: (res) => {
            console.log('Register User:', res);
        },
        onError: (err) => {
            console.error(err.message || 'An error occurred');
        },
    });

    const { refetch: makeTestReq } = useFetch({
        auto: true,
        url: `/api/test`,
        withAuth: false,
        onSuccess: (res) => {
            console.log('Make Test Request:', res);
        },
        onError: (err) => {
            console.error(err.message || 'An error occurred');
        },
    });


    const onRegister = async (e) => {
        registerUser({
            payload: {
                db_name: "testPYTHONMICROSERVICE",
                email: "aman@example.com",
                password: "12345678"
            }
        })
    }


    const onLogin = async (e) => {
        login({
            payload: {
                db_name: "testPYTHONMICROSERVICE",
                email: "aman@example.com",
                password: "12345678"
            }
        })
    }


    return (
        <div className="p-8 flex flex-col gap-4 items-center">
            <h1 className="text-2xl font-bold mb-4">API Test Demo</h1>


            <button
                onClick={onLogin}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
                Make Login Request
            </button>
            <button
                onClick={onRegister}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
                Make Register Request
            </button>
        </div>
    )
}

export default Demo