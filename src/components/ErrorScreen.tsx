interface ErrorScreenProps {
  error: string
  onRetry: () => void
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  const isAuth = error.includes('авторизо')

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="max-w-sm text-center space-y-4 p-6">
        <div className="text-4xl">⚠️</div>
        <p className="text-gray-800 font-medium">{error}</p>
        {isAuth && (
          <p className="text-gray-500 text-sm">
            Откройте{' '}
            <a
              href="https://conf.ontico.ru/lectures/review"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              conf.ontico.ru
            </a>{' '}
            и войдите в аккаунт, затем повторите попытку.
          </p>
        )}
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Повторить
        </button>
      </div>
    </div>
  )
}
