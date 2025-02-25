import * as Toast from '@radix-ui/react-toast';
import { X } from 'lucide-react';
export const Toaster = ({ children }) => {
  return (
    <Toast.Provider>
      {children}
      <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-[2147483647]" />
    </Toast.Provider>
  );
};

export const ToastDemo = ({ title, description, variant = 'default' }) => {
  const [open, setOpen] = React.useState(true);
  
  const variantClasses = {
    default: 'bg-gray-900 border border-gray-800',
    success: 'bg-green-900 border border-green-800',
    destructive: 'bg-red-900 border border-red-800',
  };

  return (
    <Toast.Root
      className={`${variantClasses[variant]} rounded-lg shadow-lg p-4 grid grid-cols-[auto_max-content] items-center gap-4`}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex-1">
        <Toast.Title className="font-medium text-gray-100 mb-1">
          {title}
        </Toast.Title>
        {description && (
          <Toast.Description className="text-sm text-gray-400">
            {description}
          </Toast.Description>
        )}
      </div>
      <Toast.Action asChild altText="Close">
        <button className="text-gray-400 hover:text-gray-200">
          <Cross2 className="h-4 w-4" />
        </button>
      </Toast.Action>
    </Toast.Root>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const toast = ({ title, description, variant }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
  };

  return {
    toast,
    Toasts: () => (
      <>
        {toasts.map((toast) => (
          <ToastDemo
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
          />
        ))}
      </>
    ),
  };
};