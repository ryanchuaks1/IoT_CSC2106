// Import user-defined files
import Header from "@/components/Header";
import Barchart from "@/components/Barchart";
import { Endpoint } from "@/app/api/sandbox/types";

export default function Home() {
  return (
    <div className="min-h-screen min-w-screen bg-white w-">
      <Header />
      <div className="lg:flex">
        <Barchart
          header={"Traffic I/O by time of day"}
          dataPoints={["Morning", "Afternoon", "Evening", "Night"]}
          dataDescription={["Input", "Output"]}
          chartWidth="w-max-content lg:w-1/2"
        />
        <Barchart
          header={"Average traffic I/O by Junction"}
          dataPoints={["Junc_1", "Junc_2", "Junc_3", "Junc_4"]}
          dataDescription={["Input", "Output"]}
          chartWidth="w-max-content lg:w-1/2"
        />
      </div> 
    </div>
  );
}
