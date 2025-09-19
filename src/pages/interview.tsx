import { useTransition, useEffect, useState } from "react";
import { ChitService } from "../services/chit.service";

export default function Interview() {
    const [isPending, startTransition] = useTransition();
    const [data, setData] = useState(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        startTransition(async() => {
            try {
                // Clear any previous errors
                setError(null);
                
                const chitsResponse = await ChitService.getAllChits({ limit: 10 });
                if (chitsResponse.success && chitsResponse.data) {
                    // Check if data array is empty
                    if (chitsResponse.data.length === 0) {
                        setError("No chit data available");
                        setData(null);
                    } else {
                        setData(chitsResponse.data.map((v: { chit_no: string; amount: string }) => <div key={v.chit_no}>{v.chit_no}: {'\u20B9'}{v.amount}</div>));
                    }
                } else {
                    throw new Error("Failed to fetch data: " + (chitsResponse.error || 'Unknown error'));
                }
            } catch(error) {
                setError(error instanceof Error ? error.message : "An unexpected error occurred");
                setData(null);
            } 
        });
    }, []); // Empty dependency array means this runs only once on mount
    
    return (
        <div>
            {isPending ? (
                "Loading..."
            ) : error ? (
                <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', backgroundColor: '#ffebee' }}>
                    <strong>Error:</strong> {error}
                </div>
            ) : data ? (
                <>
                    <div>Interview Page Content</div>
                    {data}
                </>
            ) : (
                <div>No data available</div>
            )}
        </div>
    )
}