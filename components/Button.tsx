import Tooltip from "./Tooltip";

type Props = {
    onClick: Function,
    size: string,
    children: string,
    tooltip?: string
};

export default function Button({ onClick, size, children, tooltip }: Props) {
    const button = size === "lg" ? <div className="h-12 w-80 border-green border-solid border-2 rounded-3xl align-middle hover:bg-green hover:cursor-pointer group" onClick={e => onClick()}>
        <div className="text-white font-bold text-xl text-center h-12 top-1.5 relative group-hover:text-black">{children}</div>
    </div> :
    <div className="h-10 w-32 border-green border-solid border-2 rounded-3xl align-middle hover:bg-green hover:cursor-pointer group" onClick={e => onClick()}>
        <div className="text-white font-bold text-md text-center h-12 top-1 relative group-hover:text-black">{children}</div>
    </div>;
    return tooltip ? <Tooltip text={tooltip}>
        {button}
    </Tooltip> : 
    button;
}

