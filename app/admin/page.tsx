import { getCategories } from '@/app/actions/recipes'
import { AdminDashboard } from './AdminDashboard'

import packageJson from '../../package.json'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const categories = await getCategories()

    return <AdminDashboard categories={categories} version={packageJson.version} />
}
