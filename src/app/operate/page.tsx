const page = () => {
  return (
    <div className="flex h-[100dvh] justify-center items-center">
      <div className="container mx-auto">
        <div className="grid grid-cols-12 space-x-2">
          <div className="col-span-4">
            <div className="flex justify-center items-center">
              <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                  <label htmlFor="name">Action Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="action name..."
                    //   value={message}
                    //   onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="name">Time Start</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="time start..."
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="name">Time End</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="time end..."
                  />
                </div>
                <button className="w-full bg-violet-500 hover:bg-violet-900 transition duration-300 text-white p-2 rounded">
                  Create
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-4">
            <table className="w-full  text-sm text-left rtl:text-right text-black">
              <thead className="text-xs text-black uppercase bg-gray-200">
                <tr>
                  <th>Action</th>
                  <th>Code</th>
                </tr>
              </thead>
              <tr>
                <td>Idle</td>
                <td>0</td>
              </tr>
            </table>
          </div>
          <div className="col-span-3">
            <div className="mb-4">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Please Input..."
              />
            </div>
            <button className="w-full bg-violet-500 hover:bg-violet-900 transition duration-300 text-white p-2 rounded">
              Send to Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
