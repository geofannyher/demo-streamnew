const Alert = ({ popupMessage }: { popupMessage: string }) => {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md rounded-xl shadow-lg bg-white p-5 text-left text-sm alert">
      <h1>{popupMessage}</h1>
    </div>
  );
};

export default Alert;
