
export async function checkBalance(address) {
    try {
        const response = await fetch('/api/getBJTBalance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ account: address })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            console.log('Response from contract:', result.data);
            return result.data;
        } else {
            console.error('Error in contract call:', result.error);
        }
    } catch (error) {
        console.error('Error calling the smart contract:', error);
    }
}