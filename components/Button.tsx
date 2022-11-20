type Props = {
    onClick: Function,
    size: string,
    children: string
};

export default function Button({ onClick, size, children }: Props) {
    return <div className="h-12 w-80 border-green border-solid border-2 rounded-3xl absolute align-middle hover:bg-green hover:cursor-pointer group" onClick={e => onClick()}>
        <div className="text-white font-bold text-xl text-center h-12 top-1.5 relative group-hover:text-black">{children}</div>
    </div>;
}