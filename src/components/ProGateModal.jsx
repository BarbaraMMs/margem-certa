export default function ProGateModal({ recurso, descricao, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Disponível no MargemCerta Pro</h3>
        {recurso && <p className="text-sm font-medium text-gray-700 mb-2">{recurso}</p>}
        {descricao && <p className="text-sm text-gray-600 mb-4">{descricao}</p>}
        <p className="text-sm font-semibold text-gray-800 mb-4">R$29/mês ou R$249/ano</p>
        <div className="flex flex-wrap gap-2">
          <a
            href="#"
            className="flex-1 text-center bg-green-800 hover:bg-green-900 text-white font-semibold px-4 py-3 rounded-xl text-sm cursor-pointer"
          >
            Quero ser Pro
          </a>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-3 rounded-xl text-sm cursor-pointer"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
