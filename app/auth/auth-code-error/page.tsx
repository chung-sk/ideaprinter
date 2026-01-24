export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="mb-4 text-gray-700">
          There was a problem signing you in. Please try again.
        </p>
        <a
          href="/"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
