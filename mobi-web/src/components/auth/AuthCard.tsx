interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <div
      className={`
        w-full
        max-w-md
        rounded-3xl
        border
        border-gray-300
        bg-white
        p-5
        shadow-xl
        sm:p-8
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default AuthCard;