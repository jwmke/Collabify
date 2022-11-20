import { Grid } from 'react-loading-icons';

export default function Button({ children }: { children: string }) {
    return <div className='h-screen bg-dark-gray font-lato'>
        <div className='w-full h-full absolute'>
            <div className='mx-auto top-1/3 w-24 relative text-center'>
                <Grid className='mt-10' fill="#1DB954"/>
                <p className='text-white text-xl mt-5'>{children}</p>
            </div>
        </div>
    </div>;
}

