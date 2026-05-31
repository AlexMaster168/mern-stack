import { Link as RouterLink } from 'react-router-dom'
import { useLinks } from './links.hooks'
import { LinksList } from './components/LinksList'
import { Loader } from '../../components/Loader'

export function LinksPage() {
  const { data: links, isLoading, isError } = useLinks()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои ссылки</h1>
        <RouterLink
          to="/create"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          + Создать
        </RouterLink>
      </div>

      {isLoading && <Loader />}
      {isError && <p className="text-red-600">Не удалось загрузить ссылки</p>}
      {links && <LinksList links={links} />}
    </div>
  )
}
