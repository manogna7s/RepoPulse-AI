import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/useAuth'
import useDocumentTitle from '../hooks/useDocumentTitle'

function AuthCallback() {
  useDocumentTitle('Signing in')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { completeLogin } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = params.get('token')
    const oauthError = params.get('error')

    if (oauthError) {
      setError('GitHub sign-in was cancelled or failed. You can try again from Home.')
      return
    }

    if (!token) {
      setError('No session token was returned. Please try signing in again.')
      return
    }

    completeLogin(token)
      .then(() => navigate('/', { replace: true }))
      .catch(() => setError('Could not finish sign-in. Please try again.'))
  }, [completeLogin, navigate, params])

  if (error) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center" role="alert">
        <h1 className="text-2xl font-bold text-white">Sign-in failed</h1>
        <p className="mt-3 text-sm text-slate-400">{error}</p>
        <div className="mt-6">
          <Link to="/">
            <Button>Return home</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <section className="grid min-h-[40vh] place-items-center text-center">
      <div>
        <Spinner className="mx-auto h-8 w-8 text-cyan-400" />
        <p className="mt-4 text-sm text-slate-400">Finishing GitHub sign-in…</p>
      </div>
    </section>
  )
}

export default AuthCallback
