import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export default async function CqiManagementPage({ params }: { params: { id: string } }) {
  await requireAuth(['dean', 'program_head'])
  
  const plans = await prisma.cqiActionPlan.findMany({
    where: { programId: params.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">CQI Action Plans</h1>
      <div className="grid gap-4">
        {plans.length === 0 ? (
          <p className="text-gray-500">No CQI Action Plans triggered.</p>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="p-5 bg-white shadow rounded-lg border border-gray-100 flex justify-between items-center">
              <div>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  plan.status === 'open' ? 'bg-red-100 text-red-700' :
                  plan.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {plan.status.toUpperCase()}
                </span>
                <p className="mt-2 text-gray-700">{plan.description}</p>
                <p className="text-sm text-gray-400 mt-1">Triggered by: {plan.triggeredBy}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground text-white text-sm rounded hover:bg-blue-700 transition">
                  Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
