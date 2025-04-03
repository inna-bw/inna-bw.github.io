class Canvas {
	constructor () {
		this.canvasElement = document.getElementById('canvasGrid');
		
		this.context = this.canvasElement.getContext('2d')
		this.setSize()
		window.addEventListener('resize', () => {
			this.setSize()
		})
	}

	getContext () {
		return this.context;
	}
		
	setSize () {
		this.canvasElement.width = this.canvasElement.parentNode.clientWidth;
		this.canvasElement.height = this.canvasElement.parentNode.clientWidth;
	}

	getSize () {
		return {
			width: this.canvasElement.width,
			height: this.canvasElement.height,
		}
	}

	clear () {
		const {width, height} = this.getSize();
		this.context.clearRect(0, 0, width, height)
		this.context.fillStyle = '#282222'
		this.context.fillRect(0, 0, width, height)
	}
}

const canvas = new Canvas();
canvas.clear();