graph = pydot.Dot(graph_type='digraph')

# Add nodes
node_root = pydot.Node('Root', shape='box')
node_left = pydot.Node('Left Child', shape='box')
node_right = pydot.Node('Right Child', shape='box')
node_left_left = pydot.Node('Left-Left Grandchild', shape='ellipse')
node_left_right = pydot.Node('Left-Right Grandchild', shape='ellipse')
node_right_left = pydot.Node('Right-Left Grandchild', shape='ellipse')
node_right_right = pydot.Node('Right-Right Grandchild', shape='ellipse')

# Add nodes to the graph
graph.add_node(node_root)
graph.add_node(node_left)
graph.add_node(node_right)
graph.add_node(node_left_left)
graph.add_node(node_left_right)
graph.add_node(node_right_left)
graph.add_node(node_right_right)

# Add edges
graph.add_edge(pydot.Edge(node_root, node_left, label='Feature 1 < 5'))
graph.add_edge(pydot.Edge(node_root, node_right, label='Feature 1 >= 5'))
graph.add_edge(pydot.Edge(node_left, node_left_left, label='Feature 2 < 3'))
graph.add_edge(pydot.Edge(node_left, node_left_right, label='Feature 2 >= 3'))
graph.add_edge(pydot.Edge(node_right, node_right_left, label='Feature 3 < 10'))
graph.add_edge(pydot.Edge(node_right, node_right_right, label='Feature 3 >= 10'))

# Render the graph
graph.write_png('decision_tree.png')
