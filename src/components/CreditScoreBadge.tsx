<TooltipTrigger asChild>
  <Badge variant={config?.variant || 'default'} className={`${config?.color || 'default-color'} ${textSize} cursor-help`}>
    Credit: {score}
  </Badge>
</TooltipTrigger>

<div className="space-y-1 text-xs">
  <p className="font-semibold">{config?.label || 'Credit Score'} — {score}/900</p>
  {factors && (
    <div className="space-y-2">
      {factors.map((factor, i) => (
        <div key={i}>{factor}</div>
      ))}
    </div>
  )}
</div>