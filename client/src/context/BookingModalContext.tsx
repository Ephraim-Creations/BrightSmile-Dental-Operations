import React, { createContext, useContext, useState } from 'react';

interface BookingModalContextType {
  isOpen: boolean;
  selectedService: string;
  openBookingModal: (serviceName?: string) => void;
  closeBookingModal: () => void;
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined);

export const BookingModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('General Dentistry');

  const openBookingModal = (serviceName?: string) => {
    if (serviceName) {
      setSelectedService(serviceName);
    }
    setIsOpen(true);
  };

  const closeBookingModal = () => {
    setIsOpen(false);
  };

  return (
    <BookingModalContext.Provider
      value={{
        isOpen,
        selectedService,
        openBookingModal,
        closeBookingModal,
      }}
    >
      {children}
    </BookingModalContext.Provider>
  );
};

export function useBookingModal() {
  const context = useContext(BookingModalContext);
  if (!context) {
    throw new Error('useBookingModal must be used within a BookingModalProvider');
  }
  return context;
}
