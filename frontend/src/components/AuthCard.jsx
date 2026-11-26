import { card } from '../styles';

function AuthCard({ title, children, footer }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className={`w-full max-w-sm ${card}`}>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {children}
        <p className="mt-4 text-sm text-gray-500">{footer}</p>
      </div>
    </div>
  );
}

export default AuthCard;
