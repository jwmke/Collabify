import Tooltip from "./Tooltip";

type Props = {
    onClick: Function,
    size: string,
    children: string,
    tooltip?: string,
    loading?: number
};

export default function Button({ onClick, size, children, tooltip, loading }: Props) {
    const loadingWidth = loading ? Math.min(Math.max(.14, loading), 1) * 20 : null;
    const lgBtn = loadingWidth ? 
    <div className="h-12">
        <div className="mx-auto h-12 z-10 absolute bg-green bg-opacity-50 transition rounded-3xl" style={{ width: `${loadingWidth}rem`}}/>
        <div className="mx-auto h-12 w-80 border-green bg-dark-gray bg-opacity-80 hover:bg-opacity-100 border-solid border-2 rounded-3xl align-middle hover:bg-green hover:cursor-pointer group" onClick={e => onClick()}>
            <div className="text-white z-20 font-bold text-xl text-center h-12 top-1.5 relative group-hover:text-black">{children}</div>
        </div>
    </div>
    
    : <div className="mx-auto h-12 w-80 border-green bg-dark-gray bg-opacity-80 backdrop-blur-sm hover:bg-opacity-100 border-solid border-2 rounded-3xl align-middle hover:bg-green hover:cursor-pointer group" onClick={e => onClick()}>
        <div className="text-white font-bold text-xl text-center h-12 top-1.5 relative group-hover:text-black">{children}</div>
    </div>;

    const smBtn = <div className="h-10 w-32 border-green border-solid border-2 bg-dark-gray bg-opacity-80  hover:bg-opacity-100 rounded-3xl align-middle hover:bg-green hover:cursor-pointer group" onClick={e => onClick()}>
        <div className="text-white font-bold text-md text-center h-12 top-1 relative group-hover:text-black">{children}</div>
    </div>;

    const mdBtn = <div className="h-10 w-60 mx-auto border-green border-solid border-2 bg-dark-gray bg-opacity-80  hover:bg-opacity-100 rounded-3xl align-middle hover:bg-green hover:cursor-pointer group" onClick={e => onClick()}>
    <div className="text-white font-bold text-md text-center h-12 top-1 relative group-hover:text-black">{children}</div>
    </div>;


    const button = size === "lg" ? lgBtn : size === "md" ? mdBtn : smBtn;
    return tooltip ? <Tooltip text={tooltip}>
        {button}
    </Tooltip> : 
    button;
}

