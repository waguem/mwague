export default function OfficePerformance() {
  return (
    <div className="panel lg:col-span-2 xl:col-span-3">
      <div className="mb-5">
        <h5 className="text-lg font-semibold dark:text-white-light">Performance</h5>
      </div>
      <div className="mb-5">
        <div className="table-responsive font-semibold text-[#515365] dark:text-white-light">
          <table className="whitespace-nowrap">
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Progress</th>
                <th>Task Done</th>
                <th className="text-center">Interval</th>
              </tr>
            </thead>
            <tbody className="dark:text-white-dark">
              <tr>
                <td>Expenses</td>
                <td>
                  <div className="flex h-1.5 w-full rounded-full bg-[#ebedf2] dark:bg-dark/40">
                    <div className="w-[29.56%] rounded-full bg-danger"></div>
                  </div>
                </td>
                <td className="text-danger">29.56%</td>
                <td className="text-center">2 mins ago</td>
              </tr>
              <tr>
                <td>Benefits</td>
                <td>
                  <div className="flex h-1.5 w-full rounded-full bg-[#ebedf2] dark:bg-dark/40">
                    <div className="w-1/2 rounded-full bg-info"></div>
                  </div>
                </td>
                <td className="text-success">50%</td>
                <td className="text-center">4 hrs ago</td>
              </tr>
              <tr>
                <td>Fund</td>
                <td>
                  <div className="flex h-1.5 w-full rounded-full bg-[#ebedf2] dark:bg-dark/40">
                    <div className="w-[39%] rounded-full  bg-warning"></div>
                  </div>
                </td>
                <td className="text-danger">39%</td>
                <td className="text-center">a min ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
