---
heading: A Model of the Motion of a Spring
---

{% capture block %}

## heading

test $$ x = 5 $$

$$
\left[\begin{array}{rrr|r}
1 & 2 & 4 & 8 \\
16 & 32 & 64 & 128 \\
256 & 512 & 1024 & 2048
\end{array}\right]
$$

{% endcapture %}

{% include node.html content=block %}

<div class="box">
	{% include demo.html %}
</div>
